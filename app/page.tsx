
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WelcomeLanding from './components/WelcomeLanding';
import { useAuth } from './contexts/AuthContext';
import InstantRedirect from './components/InstantRedirect';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Instant redirect component that checks localStorage immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp > currentTime) {
            // Token is valid, redirect immediately
            router.replace('/home');
            return;
          }
        } catch {
          // Invalid token, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, [router]);

  // Show loading state only while checking authentication
  if (isLoading) {
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
  if (!isAuthenticated) {
    return <WelcomeLanding />;
  }

  // This should not render as authenticated users are redirected
  return null;
}
