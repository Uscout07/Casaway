'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CongratulationsPage() {
  const router = useRouter();

  return (
    
    <div className="min-h-screen bg-ambient flex flex-col justify-center items-center font-inter">
      <div className="flex items-center space-x-2 absolute top-5 left-5">
                        <Image width={32} height={32} src="/logo.png" alt="Logo" />
                        <span className="text-forest font-bold text-lg">Casaway</span>
                      </div>
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        <div className='w-full flex items-center justify-center'><Image width={70} height={70} src="/ambientLogo.svg" alt="Logo" className='bg-forest rounded-full p-1 mb-4' /></div>
        <h1 className="text-4xl font-bold text-forest mb-4">You're all set!</h1>
        <p className="text-lg text-gray-700 mb-6">The official app launch is on [Date].</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/home')}
            className="bg-forest hover:bg-forest-medium text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Explore Mock Listings
          </button>
          <button
            onClick={() => alert('We will notify you on launch day!')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Come Back on Launch Day
          </button>
        </div>
      </div>
    </div>
  );
}