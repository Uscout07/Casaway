
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ambient flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="flex items-center space-x-2 absolute top-5 left-5 inter">
                  <Image width={32} height={32} src="/logo.png" alt="Logo" />
                  <span className="text-forest font-bold text-lg">Casaway</span>
                </div>
                <div className='w-full flex items-center justify-center'><Image width={70} height={70} src="/ambientLogo.svg" alt="Logo" className='bg-forest rounded-full p-1 mb-4' /></div>
               
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Casaway!</h1>
        <p className="text-lg text-gray-600 mb-8">Your next home swap is just a click away.</p>
        <button
          onClick={() => router.push('/legal')}
          className="bg-forest hover:bg-forest-medium text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
