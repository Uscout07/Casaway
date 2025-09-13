
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeLanding from './components/WelcomeLanding';

export default function RootPage() {
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Check authentication on client side only
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          // Check if token is expired
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp > currentTime) {
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
