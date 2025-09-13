'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingProgress from '../components/OnboardingProgress';
import Image from 'next/image';
import { Icon } from '@iconify/react';

import dynamic from 'next/dynamic';

const GoogleMap = dynamic(() => import('../components/GoogleMap'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-2"></div>
        <p className="text-gray-600">Loading Google Maps...</p>
      </div>
    </div>
  )
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
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const API_BASE_URL =  '/api';

  useEffect(() => {
    const setupAndFetch = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/locations`);

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
          setError('Could not fetch community locations.');
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('An error occurred while fetching locations.');
      } finally {
        setLoading(false);
      }
    };

    setupAndFetch();
  }, [API_BASE_URL]);

  // Helper function to render map content based on state
  const renderMapContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Icon icon="mdi:loading" className="text-4xl text-forest animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Icon icon="mdi:alert-circle" className="text-4xl text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      );
    }
    
    if (locations.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center py-12">
          <Icon icon="mdi:map-outline" className="text-6xl text-gray-300 mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">No locations yet!</p>
          <p className="text-gray-600 text-center px-4">
            Be the first to add your location to the community map.
          </p>
        </div>
      );
    }
    
    return <GoogleMap locations={locations} onLocationSelect={setSelectedLocation} />;
  };

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-4xl max-md:mt-8">
        <OnboardingProgress currentStep={4} totalSteps={4} />
        <div className="flex items-center space-x-2 absolute top-5 left-5">
          <Image width={32} height={32} src="/logo.png" alt="Logo" />
          <span className="text-forest font-bold text-lg">Casaway</span>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Icon icon="mdi:public" className="text-2xl text-forest mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Global Community</h1>
            </div>
            <p className="text-gray-600 mb-4">
              See where the Casaway community is growing around the world!
            </p>
          </div>
          
          {/* Map Container */}
          <div className="h-80 w-full">
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            }>
              {renderMapContent()}
            </Suspense>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedLocation.city}, {selectedLocation.country}
                  </h3>
                  <p className="text-sm text-gray-600">Casaway Community Member</p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>
            </div>
          )}
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
  );
}