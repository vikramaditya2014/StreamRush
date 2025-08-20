import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, channelName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserProfile = async (user: FirebaseUser, additionalData: Partial<User> = {}) => {
    if (!db) {
      console.warn('Firestore not initialized');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const userData: User = {
        uid: user.uid,
        email: email!,
        displayName: displayName || additionalData.displayName || 'Anonymous',
        photoURL: photoURL || undefined,
        channelName: additionalData.channelName || displayName || 'My Channel',
        subscribers: 0,
        subscribedTo: [],
        likedVideos: [],
        dislikedVideos: [],
        watchHistory: [],
        createdAt: new Date(),
        ...additionalData
      };

      try {
        await setDoc(userRef, userData);
        setUserProfile(userData);
      } catch (error) {
        console.error('Error creating user profile:', error);
        toast.error('Failed to create user profile');
      }
    } else {
      setUserProfile(userSnap.data() as User);
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) {
      toast.error('Authentication not available. Please configure Firebase.');
      throw new Error('Authentication not available');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Firebase authentication. Please add localhost to authorized domains in Firebase Console.');
        console.error('Firebase Auth Error: Please add localhost to authorized domains in Firebase Console > Authentication > Settings > Authorized domains');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, channelName: string) => {
    if (!auth) {
      toast.error('Authentication not available. Please configure Firebase.');
      throw new Error('Authentication not available');
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      await createUserProfile(user, { displayName, channelName });
      toast.success('Account created successfully!');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Firebase authentication. Please add localhost to authorized domains in Firebase Console.');
        console.error('Firebase Auth Error: Please add localhost to authorized domains in Firebase Console > Authentication > Settings > Authorized domains');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      toast.error('Authentication not available. Please configure Firebase.');
      throw new Error('Authentication not available');
    }
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await createUserProfile(user);
      toast.success('Logged in with Google successfully!');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Firebase authentication. Please add localhost to authorized domains in Firebase Console.');
        console.error('Firebase Auth Error: Please add localhost to authorized domains in Firebase Console > Authentication > Settings > Authorized domains');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      toast.error('Authentication not available. Please configure Firebase.');
      throw new Error('Authentication not available');
    }
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for Firebase authentication. Please add localhost to authorized domains in Firebase Console.');
        console.error('Firebase Auth Error: Please add localhost to authorized domains in Firebase Console > Authentication > Settings > Authorized domains');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser || !db) {
      toast.error('User not authenticated or database not available');
      throw new Error('User not authenticated or database not available');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Prepare the update data
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      // Update Firestore document
      await updateDoc(userRef, updateData);

      // Update Firebase Auth profile if displayName is being updated
      if (updates.displayName && auth) {
        await updateProfile(currentUser, {
          displayName: updates.displayName
        });
      }

      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updateData } : null);
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (!auth) {
      // If auth is not available, just set loading to false
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await createUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile: updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};