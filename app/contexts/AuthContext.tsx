/**
 * Authentication Context - Global State Management
 * 
 * This context provides global authentication state management for the Casaway
 * web application. It handles user authentication, token management, and
 * automatic authentication validation across the entire application.
 * 
 * Key Features:
 * - Global authentication state management
 * - JWT token storage and validation
 * - Automatic token refresh and validation
 * - User data persistence across sessions
 * - Authentication status tracking
 * - Secure logout functionality
 * - API integration for token validation
 * 
 * @author Casaway Development Team
 * @version 1.0.0
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * User Interface - TypeScript Type Definition
 * 
 * Defines the structure of user data stored in the authentication context,
 * including profile information and authentication status.
 */
interface User {
  _id: string;                      // Unique user identifier
  username: string;                 // Username for login and display
  name?: string;                    // Display name (optional)
  email?: string;                   // Email address (optional)
  profilePic?: string;              // Profile picture URL (optional)
  prelaunch_completed?: boolean;    // Onboarding completion status
}

/**
 * Auth Context Type - Context Interface Definition
 * 
 * Defines the shape of the authentication context, including all
 * state variables and methods available to consuming components.
 */
interface AuthContextType {
  user: User | null;                // Current authenticated user
  token: string | null;             // JWT authentication token
  isLoading: boolean;               // Loading state for auth operations
  isAuthenticated: boolean;         // Authentication status flag
  login: (token: string, user: User) => void; // Login method
  logout: () => void;               // Logout method
  validateToken: () => Promise<boolean>; // Token validation method
}

/**
 * Authentication Context Creation
 * 
 * Creates the React context for authentication state management.
 * Initialized as undefined to enforce proper provider usage.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Hook - Context Consumer
 * 
 * Custom hook to access the authentication context with proper
 * error handling for components outside the provider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Props - Component Props Interface
 * 
 * Defines the props interface for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * API Base URL Configuration
 * 
 * Configure the backend API URL for authentication requests.
 * Falls back to localhost for development.
 */
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
