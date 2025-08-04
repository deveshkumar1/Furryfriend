
'use server';
/**
 * @fileOverview A Genkit flow for creating Firebase users from the admin panel.
 *
 * - createFirebaseUser: A function that handles creating a user in Firebase Auth and Firestore.
 * - CreateUserInputSchema: The Zod schema for the input data.
 * - CreateUserOutputSchema: The Zod schema for the output data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// Define the input schema for the flow
export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  isAdmin: z.boolean().default(false),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// Define the output schema for the flow
export const CreateUserOutputSchema = z.object({
  uid: z.string().optional(),
  error: z.string().optional(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;


// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  // IMPORTANT: The service account credentials should be stored securely as environment variables.
  // In Firebase/Google Cloud environments, this can often be handled automatically.
  // For local development, you might need a service account JSON file.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Define the main exported function that the client will call
export async function createFirebaseUser(input: CreateUserInput): Promise<CreateUserOutput> {
  return createUserFlow(input);
}


const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input): Promise<CreateUserOutput> => {
    try {
      // 1. Create the user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.name,
      });

      const { uid } = userRecord;

      // 2. Set custom claims if the user is an admin
      if (input.isAdmin) {
        await auth.setCustomUserClaims(uid, { admin: true });
      }

      // 3. Create the user document in Firestore
      const userDocRef = db.collection('users').doc(uid);
      await userDocRef.set({
        uid,
        name: input.name,
        email: input.email,
        isAdmin: input.isAdmin,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        phone: '', // Initialize phone field as per schema
      });

      return { uid };

    } catch (error: any) {
      console.error('Error in createUserFlow:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-exists':
            errorMessage = 'The email address is already in use by another account.';
            break;
          case 'auth/invalid-password':
            errorMessage = 'The password must be a string with at least 6 characters.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      return { error: errorMessage };
    }
  }
);
