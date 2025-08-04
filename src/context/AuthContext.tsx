
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface UserProfile extends DocumentData {
  uid: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  // Add other profile fields as needed
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      setUserProfile(null);

      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile({ uid: firebaseUser.uid, ...userDocSnap.data() } as UserProfile);
          } else {
            // This case might happen if user doc creation failed during signup
            // Or if user was created directly in Firebase console without a corresponding doc
            console.warn(`No user profile document found for UID: ${firebaseUser.uid}`);
             // Create a basic profile if missing - or handle as an error
            setUserProfile({ uid: firebaseUser.uid, email: firebaseUser.email || "N/A", isAdmin: false });
          }
        } catch (e: any) {
          console.error("Error fetching user profile:", e);
          setError(e);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    }, (authError) => {
        console.error("Auth state error:", authError);
        setError(authError);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // You can replace this with a more sophisticated loading spinner/page
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
