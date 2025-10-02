
/**
 * Root Page - Landing and Authentication Gateway
 * 
 * This is the main entry point for the Casaway web application. It serves as
 * the landing page for unauthenticated users and automatically redirects
 * authenticated users to the home dashboard.
 * 
 * Key Features:
 * - Client-side authentication checking
 * - JWT token validation and expiration handling
 * - Automatic redirects based on authentication status
 * - Welcome landing page display for new users
 * - Hydration-safe rendering with SSR compatibility
 * - Local storage integration for persistent authentication
 * 
 * @author Casaway Development Team
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeLanding from './components/WelcomeLanding';

/**
 * Root Page Component
 * 
 * Main entry point that handles authentication state and routing.
 * Displays welcome landing page for unauthenticated users and
 * redirects authenticated users to the home dashboard.
 */
export default function RootPage() {
  // ===== STATE MANAGEMENT =====
  const [isClient, setIsClient] = useState(false);           // Client-side hydration flag
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
  const [isLoading, setIsLoading] = useState(true);          // Loading state
  const router = useRouter();                                // Next.js router instance

  /**
   * Authentication Check Effect
   * 
   * Runs on component mount to check authentication status from localStorage.
   * Validates JWT token expiration and redirects authenticated users.
   */
  useEffect(() => {
    setIsClient(true);
    
    /**
     * Client-side Authentication Check
     * 
     * Validates stored authentication tokens and redirects users accordingly.
     * Only runs on client-side to prevent SSR hydration issues.
     */
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          // Check if JWT token is expired by decoding payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp > currentTime) {
            // Token is valid, user is authenticated
            setIsAuthenticated(true);
            router.replace('/home');
            return;
          } else {
            // Token expired, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
        setIsAuthenticated(false);
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state during hydration
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-ambient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome landing for unauthenticated users
  return <WelcomeLanding />;
}
