
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './header';
import MobileNav from './mobileNav';

const protectedRoutes = ['/home', '/settings', '/messages', '/profile', '/search', '/upload', '/notifications', '/chat'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (token && pathname === '/') {
      router.push('/home');
    } else if (isProtectedRoute && !token) {
      router.push('/');
    }

    setIsProtected(isProtectedRoute);
  }, [pathname, router]);

  return (
    <div className="bg-ambient min-h-screen">
      {isProtected && <Header />}
      {children}
      {isProtected && <MobileNav />}
    </div>
  );
}
