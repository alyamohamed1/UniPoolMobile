import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  userId: string;
  email: string;
  name: string;
  role: 'driver' | 'rider' | null;
  universityId: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  ridesCompleted: number;
  createdAt: Date;
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    name: string,
    universityId: string,
    phone: string
  ): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // Validate email domain
      if (!email.endsWith('@aubh.edu.bh')) {
        return {
          success: false,
          error: 'Please use your AUBH email address (@aubh.edu.bh)',
        };
      }

      // Create user in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Create user document in Firestore
      const userData: UserData = {
        userId: user.uid,
        email: user.email || email,
        name,
        role: null, // Will be set in role-selection screen
        universityId,
        phone,
        rating: 5.0,
        ridesCompleted: 0,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        success: true,
        userId: user.uid,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred during sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sign in existing user
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; userData?: UserData }> {
    try {
      // Sign in with Firebase Auth
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User data not found',
        };
      }

      const userData = userDoc.data() as UserData;

      return {
        success: true,
        userData,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);

      // Handle specific Firebase errors
      let errorMessage = 'An error occurred during sign in';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Failed to sign out',
      };
    }
  },

  /**
   * Get current user data from Firestore
   */
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        return null;
      }

      return userDoc.data() as UserData;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Update user role (driver or rider)
   */
  async updateUserRole(
    userId: string,
    role: 'driver' | 'rider'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: 'Failed to update user role',
      };
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return auth.currentUser;
  },
};