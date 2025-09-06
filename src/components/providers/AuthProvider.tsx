"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, signOut, AuthUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

// Types
interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      console.log('User authenticated:', userData.username);
    } catch (error) {
      console.log('User not authenticated - this is normal for development');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      console.log('User signed out');
      // Don't redirect for now - just log
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Guard Component - Modified to not redirect in development
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // For development - show content even if not authenticated
  // Add a banner to indicate auth status
  if (!isAuthenticated) {
    return (
      <div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-bold">Development Mode</p>
          <p>Not authenticated - this is normal during development</p>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}