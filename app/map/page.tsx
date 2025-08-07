'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProgress from '../components/OnboardingProgress';
import Image from 'next/image';
import 'leaflet/dist/leaflet.css';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), { 
  ssr: false 
});

interface ApiLocation {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface MapLocation {
    city: string;
    country: string;
    lat: number;
    lng: number;
}

export default function SocialProofMapPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // --- THIS IS THE CORRECT API ROUTE ---
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`);

        if (res.ok) {
          const data: ApiLocation[] = await res.json();
          const formattedLocations = data
            .filter(loc => typeof loc.latitude === 'number' && typeof loc.longitude === 'number')
            .map(loc => ({
              city: loc.city,
              country: loc.country,
              lat: loc.latitude!,
              lng: loc.longitude!,
            }));
          setLocations(formattedLocations);
        } else {
          console.error('Failed to fetch locations');
          setError('Could not fetch community locations.');
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('An error occurred while fetching locations.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Helper function to render map content based on state
  const renderMapContent = () => {
    if (loading) {
      return <div className="flex h-full items-center justify-center"><p>Loading map...</p></div>;
    }
    if (error) {
      return <div className="flex h-full items-center justify-center"><p className="text-red-600">{error}</p></div>;
    }
    if (locations.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="font-semibold">No locations to display yet!</p>
          <p className="text-sm text-gray-500">Be the first to add your location.</p>
        </div>
      );
    }
    return <Map locations={locations} />;
  };

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-4xl">
        <OnboardingProgress currentStep={4} totalSteps={4} />
         <div className="flex items-center space-x-2 absolute top-5 left-5">
                                <Image width={32} height={32} src="/logo.png" alt="Logo" />
                                <span className="text-forest font-bold text-lg">Casaway</span>
                              </div>
              <div className="w-full max-w-2xl"></div>
        <div className="mt-8 bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">See where the Casway community is growing!</h1>
          <p className="text-gray-600 mb-6">You're joining a global community of home-swappers.</p>
          
          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
            {renderMapContent()}
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push('/congratulations')}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-forest hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}