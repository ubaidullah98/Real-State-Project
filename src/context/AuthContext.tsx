import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsRole: (role: UserRole, email?: string) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: AppUser = {
  uid: 'admin-owner-01',
  email: 'ubaidullahbhutto1998@gmail.com',
  displayName: 'Ubaidullah Bhutto (Al-Basit Owner)',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(DEFAULT_ADMIN);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const isOwner = user.email === 'ubaidullahbhutto1998@gmail.com';
        setCurrentUser({
          uid: user.uid,
          email: user.email || 'ubaidullahbhutto1998@gmail.com',
          displayName: user.displayName || (isOwner ? 'Ubaidullah Bhutto (Owner)' : 'Al-Basit Executive'),
          role: isOwner ? 'admin' : 'project_manager',
          photoURL: user.photoURL || undefined,
        });
      } else {
        // Fallback to initial company owner session for seamless immediate usage
        setCurrentUser(DEFAULT_ADMIN);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const isOwner = result.user.email === 'ubaidullahbhutto1998@gmail.com';
        setCurrentUser({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Authorized User',
          role: isOwner ? 'admin' : 'project_manager',
          photoURL: result.user.photoURL || undefined,
        });
      }
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const loginAsRole = (role: UserRole, customEmail?: string) => {
    const email = customEmail || (role === 'admin' ? 'ubaidullahbhutto1998@gmail.com' : `${role}@albasitbuilders.com`);
    const nameMap: Record<UserRole, string> = {
      admin: 'Ubaidullah Bhutto (Super Admin & Owner)',
      project_manager: 'Engr. Tariq Aziz (Project Manager)',
      accountant: 'Naveed Akhtar (Chief Financial Accountant)',
      sales_agent: 'Zeeshan Haider (Senior Property Consultant)',
    };

    setCurrentUser({
      uid: `role-${role}-${Date.now()}`,
      email,
      displayName: nameMap[role],
      role,
    });
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'ubaidullahbhutto1998@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        loginWithGoogle,
        loginAsRole,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
