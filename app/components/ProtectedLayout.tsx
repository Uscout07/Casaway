
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './header';
import MobileNav from './mobileNav';
import { useAuth } from '../contexts/AuthContext';

const protectedRoutes = ['/home', '/settings', '/messages', '/profile', '/search', '/upload', '/chat', '/admin', '/listing', '/referral', '/notifications'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth context to load

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Instant redirects - no loading states
    if (isProtectedRoute && !isAuthenticated) {
      router.replace('/');
    } else if (isAuthenticated && pathname === '/') {
      router.replace('/home');
    }

    setIsProtected(isProtectedRoute);
  }, [pathname, isAuthenticated, isLoading, router]);

  // Show loading state only while checking authentication
  if (isLoading) {
    return (
      <div className="bg-ambient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ambient min-h-screen">
      {isProtected && <Header />}
      {children}
      {isProtected && <MobileNav />}
    </div>
  );
}
