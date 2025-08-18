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
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Use individual environment variables
      credential = admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else {
      // Use default credentials (works in Firebase Functions and other Google Cloud environments)
      credential = admin.credential.applicationDefault();
    }

    adminApp = admin.initializeApp({
      credential,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Firebase Admin initialization failed. Check your credentials.');
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
