
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProgress from '../components/OnboardingProgress';
import Image from 'next/image';

export default function LegalAgreementPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center justify-center px-6 py-8">
      <div className="flex items-center space-x-2 absolute top-5 left-5">
                        <Image width={32} height={32} src="/logo.png" alt="Logo" />
                        <span className="text-forest font-bold text-lg">Casaway</span>
                      </div>
      <div className="w-full max-w-2xl max-md:mt-8">
        <OnboardingProgress currentStep={1} totalSteps={4} />
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Legal Agreement</h1>
          <div className="prose max-w-none">
            <p>
              Please review our <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
          </div>
          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agree" className="ml-2 block text-sm text-gray-900">
              I agree to the Terms and Conditions and Privacy Policy.
            </label>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/auth?mode=register')}
              disabled={!agreed}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
