
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, DocumentData } from 'firebase/firestore';

// This script uses the SAME Firebase configuration as your web app.
// It relies on the environment variables you have set in your .env.local file.
// Make sure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc. are available.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- SCRIPT EXECUTION ---

async function migrateUsers() {
  console.log("Starting user migration script...");

  // Validate environment variables
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(
      "Firebase config is missing. Ensure your .env.local file is populated and run the script with 'npm run migrate:users'."
    );
    process.exit(1); // Exit with an error code
  }
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const usersCollectionRef = collection(db, 'users');

  console.log("Fetching all user documents from the 'users' collection...");
  let updatedCount = 0;
  let processedCount = 0;

  try {
    const querySnapshot = await getDocs(usersCollectionRef);
    processedCount = querySnapshot.size;
    console.log(`Found ${processedCount} users to process.`);

    const updatePromises: Promise<void>[] = [];

    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as DocumentData;

      // Check if the 'phone' field is missing or not a string.
      // Using 'hasOwnProperty' is a safe way to check for the field's existence.
      if (!Object.prototype.hasOwnProperty.call(userData, 'phone')) {
        console.log(`User ${userDoc.id} (${userData.email}) is missing 'phone' field. Scheduling for update.`);
        const userDocRef = doc(db, 'users', userDoc.id);
        updatePromises.push(updateDoc(userDocRef, { phone: '' }));
        updatedCount++;
      }
    });

    if (updatePromises.length > 0) {
      console.log(`\nUpdating ${updatePromises.length} users...`);
      await Promise.all(updatePromises);
      console.log("All user documents have been updated successfully.");
    } else {
      console.log("\nNo users needed updates. All documents already have the 'phone' field.");
    }

  } catch (error) {
    console.error("\nAn error occurred during the migration:", error);
    process.exit(1);
  }

  console.log("\n--- Migration Summary ---");
  console.log(`Total users processed: ${processedCount}`);
  console.log(`Users updated: ${updatedCount}`);
  console.log("Migration script finished successfully!");
  process.exit(0); // Exit successfully
}


// Run the script
migrateUsers();
