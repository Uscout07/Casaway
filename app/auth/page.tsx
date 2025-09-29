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
  loginIdentifier: string; // For login mode - can be email or username
  password: string;
  confirmPassword: string;
  resetCode: string; // For password reset
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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('register');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [inviteeName, setInviteeName] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    username: '',
    email: '',
    loginIdentifier: '',
    password: '',
    confirmPassword: '',
    resetCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load signup draft for register mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mode !== 'register') return;
    try {
      const draftRaw = localStorage.getItem('draft_signup');
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        setFormData(prev => ({
          ...prev,
          name: draft?.name ?? prev.name,
          username: draft?.username ?? prev.username,
          email: draft?.email ?? prev.email,
        }));
      }
    } catch {}
  }, [mode]);

  const handleSaveSignupDraft = () => {
    if (typeof window === 'undefined') return;
    const draft = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('draft_signup', JSON.stringify(draft));
    alert('Signup draft saved. You can resume from Settings > Drafts.');
  };

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
    if (mode === 'login') {
      if (!formData.loginIdentifier || !formData.password) {
        setError('Email/Username and password are required.');
        return false;
      }
    } else {
      // Register mode validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return false;
      }
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
        ? (() => {
            // Determine if loginIdentifier is email or username
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailRegex.test(formData.loginIdentifier);
            
            return isEmail 
              ? { email: formData.loginIdentifier, password: formData.password }
              : { username: formData.loginIdentifier, password: formData.password };
          })()
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

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to send reset code');
      }

      setSuccess('Password reset code sent to your email');
      setMode('reset-password');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.resetCode || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          resetCode: formData.resetCode,
          newPassword: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to reset password');
      }

      setSuccess('Password reset successful! You can now sign in.');
      setMode('login');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '', resetCode: '' }));
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ambient min-h-screen flex items-center justify-center px-4 sm:px-6 py-[8vh]">
      <Suspense fallback={null}>
        <ReferralHandler setRefCode={setRefCode} setInviteeName={setInviteeName} />
      </Suspense>
       
      <div className="w-full max-w-md max-md:mt-8">
        <div className="flex items-center space-x-2 absolute top-5 left-5">
                              <Image width={32} height={32} src="/logo.png" alt="Logo" />
                              <span className="text-forest font-bold text-lg">Casaway</span>
                            </div>
            <div className="w-full max-w-2xl"></div>
        {mode !== 'login' && (
          <OnboardingProgress currentStep={2} totalSteps={4} />
        )}

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

        {/* Primary Auth Card - login/register only */}
        {(mode === 'login' || mode === 'register') && (
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
            {mode === 'login' ? (
            <div>
              <label className="block text-sm mb-1">Email or Username</label>
              <input
                name="loginIdentifier"
                type="text"
                value={formData.loginIdentifier}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="you@example.com or username"
              />
            </div>
            ) : (
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
            )}
            <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} className="w-5 h-5" />
              </button>
            </div>
            {mode === 'login' && (
              <div className="text-right mt-2">
                <button
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-forest hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            </div>
            {mode === 'register' && (
              <div>
              <label className="block text-sm mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <Icon icon={showConfirm ? 'mdi:eye-off' : 'mdi:eye'} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-forest text-white py-2 rounded hover:bg-forest-dark disabled:opacity-50"
              >
                {loading
                  ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
                  : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
              {mode === 'register' && (
                <button
                  type="button"
                  onClick={handleSaveSignupDraft}
                  className="flex-1 border border-forest text-forest py-2 rounded hover:bg-forest-light/30"
                >
                  Save Draft
                </button>
              )}
            </div>
          </div>
        )}

        {/* Forgot Password Form - single card mode */}
        {mode === 'forgot-password' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
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
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="flex-1 bg-forest text-white py-2 rounded hover:bg-forest-dark disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button
                onClick={() => setMode('login')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Reset Password Form - single card mode */}
        {mode === 'reset-password' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Enter Reset Code</h2>
            <div>
              <label className="block text-sm mb-1">Reset Code</label>
              <input
                name="resetCode"
                type="text"
                value={formData.resetCode}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                >
                  <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                >
                  <Icon icon={showConfirm ? 'mdi:eye-off' : 'mdi:eye'} className="w-5 h-5" />
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="flex-1 bg-forest text-white py-2 rounded hover:bg-forest-dark disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                onClick={() => setMode('forgot-password')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

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
