'use server';

import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/lib/firebase-admin';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  isAdmin: z.boolean().default(false),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export interface CreateUserResult {
  success: boolean;
  uid?: string;
  error?: string;
}

export async function createUserServerAction(input: CreateUserInput): Promise<CreateUserResult> {
  console.log('Starting user creation process...', { email: input.email, isAdmin: input.isAdmin });
  
  try {
    // Validate input
    const validatedInput = CreateUserSchema.parse(input);
    console.log('Input validation successful');
    
    // Get Firebase Admin instances
    console.log('Getting Firebase Admin instances...');
    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminFirestore();
    console.log('Firebase Admin instances obtained');

    // Create user in Firebase Authentication
    console.log('Creating user in Firebase Auth...');
    const userRecord = await auth.createUser({
      email: validatedInput.email,
      password: validatedInput.password,
      displayName: validatedInput.name,
    });
    console.log('User created in Firebase Auth:', userRecord.uid);

    const { uid } = userRecord;

    // Set custom claims if admin
    if (validatedInput.isAdmin) {
      console.log('Setting admin custom claims...');
      await auth.setCustomUserClaims(uid, { admin: true });
      console.log('Admin custom claims set');
    }

    // Create user document in Firestore
    console.log('Creating user document in Firestore...');
    await db.collection('users').doc(uid).set({
      uid,
      name: validatedInput.name,
      email: validatedInput.email,
      isAdmin: validatedInput.isAdmin,
      phone: '',
      createdAt: new Date().toISOString(),
    });
    console.log('User document created in Firestore');

    return {
      success: true,
      uid,
    };

  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = 'An unexpected error occurred while creating the user.';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-exists':
          errorMessage = 'The email address is already in use by another account.';
          break;
        case 'auth/invalid-password':
          errorMessage = 'The password must be at least 8 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please use a stronger password.';
          break;
        default:
          errorMessage = `Firebase error: ${error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
