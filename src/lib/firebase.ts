
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables
// IMPORTANT: Ensure these variables are set in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId is optional and not used in this app
};

// Initialize Firebase
let app: FirebaseApp;

// Check if all required Firebase config keys are present.
// This is a crucial check to prevent silent failures.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase API Key or Project ID is missing. " +
    "Please ensure your .env.local file is correctly set up with all NEXT_PUBLIC_FIREBASE_* variables " +
    "and that you have restarted your Next.js development server."
  );
  // Throwing an error here can make debugging easier than letting the Firebase SDK fail.
}

// Initialize Firebase App
// This pattern prevents re-initializing the app on every hot-reload in development
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // If already initialized, use that instance
}

// Get and export Firebase services
// It's a good practice to initialize them once and export them for use throughout the app.
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/* 
* Firestore Security Rules for this project:
*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Function to check if a user has the 'admin' role
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users can manage their own user document
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth != null;
      // Admins can list all users
      allow list: if isAdmin();
    }

    // Users can manage their own data, Admins can read anyone's data
    match /pets/{petId} {
      allow read, write, delete: if (request.auth.uid == resource.data.userId) || (request.auth.uid == request.resource.data.userId) || isAdmin();
    }

    match /vaccinations/{vaccinationId} {
      allow read, write, delete: if (request.auth.uid == resource.data.userId) || (request.auth.uid == request.resource.data.userId) || isAdmin();
    }
    
    match /medications/{medicationId} {
        allow read, write, delete: if (request.auth.uid == resource.data.userId) || (request.auth.uid == request.resource.data.userId) || isAdmin();
    }
    
    // Users can manage their own saved vets
    match /users/{userId}/savedVets/{vetId} {
       allow read, write, delete: if request.auth.uid == userId || isAdmin();
    }
  }
}
*/

export { app, db, auth, storage };
