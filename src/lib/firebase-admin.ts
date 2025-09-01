import * as admin from 'firebase-admin';

let adminApp: admin.app.App | undefined;

export function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Try to get existing app first
    adminApp = admin.app();
    return adminApp;
  } catch (error) {
    // App doesn't exist, need to initialize
  }

  try {
    let credential;
    
    // Try to use service account JSON if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Using FIREBASE_SERVICE_ACCOUNT credential');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Using individual Firebase credential environment variables');
      // Use individual environment variables
      credential = admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      // Don't use application default credentials on Vercel - they won't work
      console.error('No Firebase Admin credentials found. Required environment variables:');
      console.error('Option 1: FIREBASE_SERVICE_ACCOUNT (full JSON)');
      console.error('Option 2: FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL + NEXT_PUBLIC_FIREBASE_PROJECT_ID');
      throw new Error('Firebase Admin credentials not configured. Please set FIREBASE_SERVICE_ACCOUNT or individual credential environment variables.');
    }

    adminApp = admin.initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    console.log('Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.error('Available environment variables:');
    console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.error('- FIREBASE_SERVICE_ACCOUNT:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
    console.error('- FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
    console.error('- FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
    
    throw new Error(`Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getFirebaseAdminAuth() {
  const app = getFirebaseAdmin();
  return admin.auth(app);
}

export function getFirebaseAdminFirestore() {
  const app = getFirebaseAdmin();
  return admin.firestore(app);
}
