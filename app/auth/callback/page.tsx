"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AuthCallback = () => {
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success === 'true' && token) {
          // Get user info from backend
          const userResponse = await fetch(`${API_BASE_URL}/api/oauth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Use the auth context login function
            login(token, userData.user);
            
            setStatus('success');
            setMessage('Successfully signed in with Google!');
            
            // Redirect to home page immediately
            router.push('/home');
          } else {
            throw new Error('Failed to get user information');
          }
        } else {
          const errorMessage = error || 'Google sign-in failed';
          setStatus('error');
          setMessage(errorMessage);
          
          // Redirect to auth page immediately
          router.push('/auth');
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred');
        
        // Redirect to auth page immediately
        router.push('/auth');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="bg-ambient flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Sign-in
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your Google sign-in...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:check" className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Casaway!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to the home page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:close" className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sign-in Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you back to the sign-in page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
