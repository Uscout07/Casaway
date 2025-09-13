"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Icon } from '@iconify/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import OnboardingProgress from '../components/OnboardingProgress';
import Logo from '../components/logo';
import { useAuth } from '../contexts/AuthContext';


interface AuthFormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ReferralHandler = ({
  setRefCode,
  setInviteeName
}: {
  setRefCode: (ref: string) => void;
  setInviteeName: (name: string) => void;
}) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    const inviteName = typeof window !== "undefined"
      ? localStorage.getItem("inviteAmbassador")
      : null;
    if (ref) setRefCode(ref);
    if (inviteName) setInviteeName(inviteName);
  }, [searchParams, setRefCode, setInviteeName]);
  return null;
};


const AuthForm = () => {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const urlMode = searchParams.get("mode") as 'login' | 'register';
    if (urlMode) setMode(urlMode);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (mode === 'register') {
      if (!formData.username) {
        setError('Username is required.');
        return false;
      }
      if (!formData.name) {
        setError('Full Name is required.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    // grab stored inviteToken if any
    const inviteToken = typeof window !== "undefined"
      ? localStorage.getItem("inviteToken")
      : null;

    try {
      const endpoint = mode === 'login'
        ? '/api/auth/login'
        : '/api/auth/register';

      const payload = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            ...(inviteToken ? { inviteToken } : {})
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || `Server error: ${response.status}`);
      }

      // save token & user using auth context
      console.log('Auth success - storing token:', data.token);
      login(data.token, data.user);
      
      if (mode === 'register') {
        router.push('/complete-profile');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      // Get invite token from localStorage if available
      const inviteToken = typeof window !== "undefined"
        ? localStorage.getItem("inviteToken")
        : null;
      
      // Build Google OAuth URL with invite token if available
      let googleOAuthUrl = `${API_BASE_URL}/api/oauth/google`;
      if (inviteToken) {
        googleOAuthUrl += `?inviteToken=${encodeURIComponent(inviteToken)}`;
      }
      
      // Redirect to Google OAuth endpoint
      window.location.href = googleOAuthUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google sign-in');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-ambient flex items-center justify-center px-6 pt-[12vh] pb-8">
      <Suspense fallback={null}>
        <ReferralHandler setRefCode={setRefCode} setInviteeName={setInviteeName} />
      </Suspense>
       
      <div className="w-full max-w-md max-md:mt-8">
        <div className="flex items-center space-x-2 absolute top-5 left-5">
                              <Image width={32} height={32} src="/logo.png" alt="Logo" />
                              <span className="text-forest font-bold text-lg">Casaway</span>
                            </div>
            <div className="w-full max-w-2xl"></div>
        <OnboardingProgress currentStep={2} totalSteps={4} />

        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 text-forest font-bold font-inter text-2xl mb-2">
            <div className='w-full flex items-center justify-center'><Image width={70} height={70} src="/ambientLogo.svg" alt="Logo" className='bg-forest rounded-full p-1' /></div>
            Casaway
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {mode === 'register' && inviteeName
              ? <>Welcome to Casaway <b>{decodeURIComponent(inviteeName)}</b>!</>
              : mode === 'login'
                ? 'Sign in to your account to continue'
                : 'Join our community to find your perfect home'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Alice Smith"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="alice123"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="••••••••"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="••••••••"
              />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-forest text-white py-2 rounded hover:bg-forest-dark disabled:opacity-50"
          >
            {loading
              ? mode === 'login' ? 'Signing In...' : 'Creating Account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* OR separator */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or continue with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full border border-gray-300 bg-white text-gray-700 py-2 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          ) : (
            <Icon icon="logos:google-icon" className="w-5 h-5" />
          )}
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="text-center text-gray-600 mt-4">
          {mode === 'login'
            ? <>Don't have an account? <button onClick={() => setMode('register')} className="text-forest">Sign up</button></>
            : <>Already have an account? <button onClick={() => setMode('login')} className="text-forest">Sign in</button></>}
        </p>
      </div>
    </div>
  );
};

const AuthPage = () => (
  <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
    <AuthForm />
  </Suspense>
);

export default AuthPage;
