import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    userType: 'buyer' | 'seller';
    createdAt: string;
    updatedAt: string;
}

export class AuthService {
    // Register a new user
    static async register(
        email: string,
        password: string,
        displayName: string,
        userType: 'buyer' | 'seller'
    ): Promise<UserProfile> {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update the user's display name
            await updateProfile(user, { displayName });

            // Create user profile in Firestore
            const userProfile: UserProfile = {
                uid: user.uid,
                email: user.email!,
                displayName,
                userType,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);

            return userProfile;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Sign in existing user
    static async signIn(email: string, password: string): Promise<UserProfile> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user profile from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                throw new Error('User profile not found');
            }

            return userDoc.data() as UserProfile;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Sign out user
    static async signOut(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Get current user profile
    static async getCurrentUserProfile(): Promise<UserProfile | null> {
        try {
            const user = auth.currentUser;
            if (!user) return null;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) return null;

            return userDoc.data() as UserProfile;
        } catch (error: any) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Listen to authentication state changes
    static onAuthStateChange(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback);
    }

    // Update user profile
    static async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No authenticated user');

            const updatedData = {
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });

            // Update display name in auth if provided
            if (updates.displayName) {
                await updateProfile(user, { displayName: updates.displayName });
            }
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
} 