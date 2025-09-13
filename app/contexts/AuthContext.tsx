'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  profilePic?: string;
  prelaunch_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state immediately from localStorage for instant loading
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!token && !!user;

  // Initialize auth state - ULTRA FAST VERSION
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (token && user) {
          // Quick client-side validation first
          if (isTokenExpired(token)) {
            logout();
            return;
          }
          
          setIsLoading(false);
          
          // Validate with backend in background (non-blocking)
          validateTokenWithBackend(token).catch(() => {
            // If backend validation fails, logout
            logout();
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      }
    };

    // Immediate initialization for fastest possible loading
    initializeAuth();
  }, [token, user]);

  // Helper function to check if token is expired (client-side)
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // If we can't parse, consider it expired
    }
  };

  const validateTokenWithBackend = async (tokenToValidate: string): Promise<boolean> => {
    try {
      // Add cache to avoid repeated API calls
      const cacheKey = `token_validation_${tokenToValidate}`;
      const cached = localStorage.getItem(cacheKey);
      const now = Date.now();
      
      // If we validated this token in the last 5 minutes, consider it valid
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        if (now - timestamp < 5 * 60 * 1000) { // 5 minutes
          return true;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Cache the validation result
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now }));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Clear all auth-related localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('inviteToken');
    
    // Clear token validation cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('token_validation_')) {
        localStorage.removeItem(key);
      }
    });
    
    router.push('/');
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token) return false;
    return await validateTokenWithBackend(token);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    validateToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
