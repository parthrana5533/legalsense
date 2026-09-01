import { useState, useEffect, type ReactNode } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  logOut,
  resetPassword as resetPasswordService,
  getCurrentUser,
  getUserProfile,
  type AuthUser,
  type UserProfile,
} from '@/services/api/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const userProfile = await getUserProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await signUpWithEmail(email, password, name);
    setUser(result.user);
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    setUser(result.user);
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const signInGoogle = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await logOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await resetPasswordService(email);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signInGoogle, logout, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
