'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstantRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check localStorage immediately and redirect before any rendering
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        // Quick client-side token validation
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

  return null; // This component renders nothing
}
