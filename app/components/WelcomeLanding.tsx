'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function WelcomeLanding() {
  return (
    <div className="min-h-screen bg-ambient flex flex-col">
      {/* Header Logo */}
      <div className="flex items-center space-x-2 p-5">
        <Image width={32} height={32} src="/logo.png" alt="Logo" />
        <span className="text-forest font-bold text-lg">Casaway</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="items-center mb-8 text-center">
          <div className="bg-forest rounded-full p-4 mb-6 inline-flex">
            <Image width={60} height={60} src="/ambientLogo.svg" alt="Ambient Logo" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome to Casaway!</h1>
          <p className="text-lg text-gray-600 leading-6 max-w-md">
            Your next home swap adventure is just a click away. Join our global community of travelers.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-4">
          <Link href="/legal" className="block">
            <button className="w-full bg-forest py-4 px-6 rounded-xl shadow-lg text-white font-semibold text-lg">
              Get Started
            </button>
          </Link>

          <Link href={{ pathname: '/auth', query: { mode: 'login' } }} className="block">
            <button className="w-full bg-white border-2 border-forest py-4 px-6 rounded-xl text-forest font-semibold text-lg">
              I already have an account
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-gray-500 text-center text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}


