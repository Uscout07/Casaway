'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function CongratulationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ambient flex flex-col">
      {/* Header Logo - Consistent with other pages */}
      <div className="flex items-center space-x-2 p-5">
        <Image width={32} height={32} src="/logo.png" alt="Logo" />
        <span className="text-forest font-bold text-lg">Casaway</span>
      </div>

      {/* Main Content - Centered and consistent with WelcomeLanding */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="text-center max-w-md">
          {/* Success Icon */}
          <div className="bg-forest rounded-full p-4 mb-6 inline-flex">
            <Icon icon="material-symbols:check-circle" className="w-16 h-16 text-white" />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome to Casaway!</h1>
          
          {/* Description */}
          <p className="text-lg text-gray-600 leading-6 mb-8">
            The official app launch is on <strong>October 15, 2025</strong>.
            <br /><br />
            Feel free to post your listing now! Come back to see all listings from college students around the world.
          </p>

          {/* Action Buttons - Consistent styling with WelcomeLanding */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/upload')}
              className="w-full bg-forest py-4 px-6 rounded-xl shadow-lg text-white font-semibold text-lg hover:bg-forest-medium transition-all duration-300 ease-in-out"
            >
              Post my listing
            </button>
            
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-white border-2 border-forest py-4 px-6 rounded-xl text-forest font-semibold text-lg hover:bg-forest-light transition-all duration-300 ease-in-out"
            >
              Come back on October 15, 2025
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-forest-light">
            <div className="flex items-center justify-center mb-2">
              <Icon icon="material-symbols:notifications" className="w-5 h-5 text-forest mr-2" />
              <span className="text-sm font-medium text-forest">Stay Updated</span>
            </div>
            <p className="text-sm text-gray-600">
              We'll send you a notification when the full platform launches with real listings and bookings.
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Consistent with other pages */}
      <div className="p-6">
        <p className="text-gray-500 text-center text-sm">
          Thank you for joining the Casaway community!
        </p>
      </div>
    </div>
  );
}