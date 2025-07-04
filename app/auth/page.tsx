'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Icon } from '@iconify/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface AuthFormData {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface AuthResponse {
    msg: string;
    token?: string;
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
        referralCode?: string;
        profilePic?: string;
    };
}

interface AuthErrorResponse {
    msg: string;
    error?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Component to handle referral code from URL params
const ReferralHandler = ({ setRefCode }: { setRefCode: (ref: string) => void }) => {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setRefCode(ref);
            console.log('[AUTH] Referral Code Detected:', ref);
        }
    }, [searchParams, setRefCode]);

    return null;
};

// Main auth form component
const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [refCode, setRefCode] = useState<string | null>(null);

    const [formData, setFormData] = useState<AuthFormData>({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const validateForm = (): boolean => {
        setError(null);
        if (!formData.email || !formData.password) {
            setError('Email and password are required.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (!isLogin) {
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
        setSuccess(null);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data: AuthResponse | AuthErrorResponse = await response.json();

            if (!response.ok) {
                const errorData = data as AuthErrorResponse;
                throw new Error(errorData.msg || `Server error: ${response.status}`);
            }

            const successData = data as AuthResponse;
            setSuccess(successData.msg || (isLogin ? 'Login successful!' : 'Registration successful!'));

            if (successData.token && successData.user) {
                localStorage.setItem('token', successData.token);
                localStorage.setItem('user', JSON.stringify(successData.user));

                if (!isLogin && refCode) {
                    await fetch(`${API_BASE_URL}/api/referral/use`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refCode, userId: successData.user._id }),
                    });
                    console.log('[AUTH] Referral code used:', refCode);
                }

                router.push('/');
            } else {
                setError('Authentication succeeded, but session data missing.');
            }

            setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });

        } catch (err: any) {
            console.error('[AUTH PAGE] Error:', err);
            setError(err.message || 'Unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(prev => !prev);
        setError(null);
        setSuccess(null);
        setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
    };

    return (
        <div className="bg-ambient flex items-center justify-center px-6 pt-[12vh] pb-8">
            {/* Wrap the ReferralHandler in Suspense */}
            <Suspense fallback={null}>
                <ReferralHandler setRefCode={setRefCode} />
            </Suspense>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className='flex flex-col items-center gap-2 text-forest font-bold font-inter text-2xl mb-2'>
                        <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center mx-auto">
                            <Image src="/ambientLogo.svg" alt="Ambient Logo" width={0} height={0} className="w-12 h-12 object-cover rounded-full" />
                        </div>
                        Casaway
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-600">
                        {isLogin
                            ? 'Sign in to your account to continue'
                            : 'Join our community to find your perfect home'}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <Icon icon="material-symbols:person-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-medium focus:border-transparent"
                                            placeholder="Enter your full name"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <Icon icon="material-symbols:person-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-medium focus:border-transparent"
                                            placeholder="Enter your username"
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Icon icon="material-symbols:mail-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-medium focus:border-transparent"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Icon icon="material-symbols:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-medium focus:border-transparent"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Icon icon="material-symbols:lock-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-medium focus:border-transparent"
                                        placeholder="Confirm your password"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                <Icon icon="material-symbols:error-outline" className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Icon icon="material-symbols:check-circle-outline" className="w-5 h-5 text-forest mr-2" />
                                <span className="text-sm text-forest-medium">{success}</span>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-forest text-white py-3 px-4 rounded-lg hover:bg-forest focus:ring-2 focus:ring-forest-medium focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
                                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                                </>
                            ) : (
                                <>
                                    <Icon icon={isLogin ? "material-symbols:login" : "material-symbols:person-add-outline"} className="w-5 h-5 mr-2" />
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </div>

                    {isLogin && (
                        <div className="mt-4 text-center">
                            <button className="text-sm text-forest hover:text-forest">Forgot your password?</button>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleAuthMode}
                            className="ml-1 text-forest hover:text-forest font-medium"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <div className="mt-8 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">or continue with</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon icon="devicon:google" className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Google</span>
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Icon icon="ic:baseline-facebook" className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Facebook</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main page component wrapped in Suspense
const AuthPage = () => {
    return (
        <Suspense fallback={
            <div className="bg-ambient flex items-center justify-center px-6 pt-10 md:pt-[12vh] pb-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded mt-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
};

export default AuthPage;