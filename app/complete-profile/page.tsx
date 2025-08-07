'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Image from 'next/image';

// Assuming this component exists and is styled correctly
const OnboardingProgress = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="w-full mb-8">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="bg-forest h-2.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
    </div>
  </div>
);


export default function CompleteProfilePage() {
  const router = useRouter();
  
  // State for form fields
  const [dream_countries, setDreamCountries] = useState('');
  const [dream_cities, setDreamCities] = useState('');
  const [swap_dates, setSwapDates] = useState({ start: '', end: '' });
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  
  // State for UI and error handling
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles auto-detection of the user's location using the browser's Geolocation API
   * and a reverse geocoding service.
   */
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Using Nominatim for reverse geocoding (no API key needed)
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data.address) {
          setCity(data.address.city || data.address.town || data.address.village || '');
          setCountry(data.address.country || '');
        } else {
          setError("Could not determine your location. Please enter it manually.");
        }
      } catch (err) {
        setError("Failed to fetch location data. Please check your connection or enter it manually.");
      } finally {
        setIsDetecting(false);
      }
    }, (geoError) => {
      setError(`Geolocation error: ${geoError.message}. Please enable location services or enter it manually.`);
      setIsDetecting(false);
    });
  };

  /**
   * Handles the form submission, validates required fields, and sends the data to the API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dream_countries || !city || !country) {
      setError('Please fill in all required fields: Your Location and Dream Countries.');
      return;
    }

    setLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      // Construct the payload for the API
      const payload: any = {
        dream_countries: dream_countries.split(',').map(s => s.trim()),
        city,
        country,
        bio: bio || '',
        dream_cities: dream_cities ? dream_cities.split(',').map(s => s.trim()) : [],
        swap_dates: (swap_dates.start && swap_dates.end) ? [{
            start: new Date(swap_dates.start),
            end: new Date(swap_dates.end),
        }] : [],
      };

      const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${api_url}/api/prelaunch/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/map');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Common input field styling
  const inputClasses = "block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-800 mb-1.5";

  return (
    <div className="min-h-screen bg-ambient flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Header Logo */}
      <div className="absolute top-5 left-5 flex items-center space-x-2">
        <Image width={32} height={32} src="/logo.png" alt="Casaway Logo" onError={(e) => e.currentTarget.src = 'https://placehold.co/32x32/228B22/FFFFFF?text=C'} />
        <span className="text-forest font-bold text-lg">Casaway</span>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        <OnboardingProgress currentStep={3} totalSteps={4} />
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="material-symbols:person-outline" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us a bit about yourself to get started.
          </p>
        </div>

        {/* Form Container */}
        <div className=" rounded-xl shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Location Group */}
            <div className="space-y-3">
              <label className={labelClasses}>Your Location *</label>
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClasses}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClasses}
                required
              />
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest disabled:opacity-50 transition-colors"
              >
                {isDetecting ? (
                  <>
                    <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Icon icon="material-symbols:my-location" className="w-5 h-5 mr-2" />
                    Auto-detect My Location
                  </>
                )}
              </button>
            </div>
            
            {/* Dream Destinations Group */}
            <div>
              <label htmlFor="dream_countries" className={labelClasses}>Dream Countries (comma-separated) *</label>
              <input
                type="text"
                id="dream_countries"
                placeholder="e.g. Italy, Japan, Brazil"
                value={dream_countries}
                onChange={(e) => setDreamCountries(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            
            <div>
              <label htmlFor="dream_cities" className={labelClasses}>Dream Cities (Optional)</label>
              <input
                type="text"
                id="dream_cities"
                placeholder="e.g. Rome, Tokyo, Rio de Janeiro"
                value={dream_cities}
                onChange={(e) => setDreamCities(e.target.value)}
                className={inputClasses}
              />
            </div>
            
            {/* Swap Dates Group */}
            <div>
                <label className={labelClasses}>Preferred Swap Dates (Optional)</label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="w-full sm:w-1/2">
                        <input
                            type="date"
                            id="start_date"
                            value={swap_dates.start}
                            onChange={(e) => setSwapDates({ ...swap_dates, start: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div className="w-full sm:w-1/2">
                        <input
                            type="date"
                            id="end_date"
                            value={swap_dates.end}
                            onChange={(e) => setSwapDates({ ...swap_dates, end: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            {/* Bio Group */}
            <div>
              <label htmlFor="bio" className={labelClasses}>Bio (Optional)</label>
              <textarea
                id="bio"
                placeholder="Tell fellow swappers a little about yourself, your home, and your travel style."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className={inputClasses}
              />
            </div>
            
            {/* Error Message Display */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <Icon icon="material-symbols:error-outline" className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-forest hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Icon icon="eos-icons:loading" className="w-5 h-5 mr-2" />
                  Completing...
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:check" className="w-5 h-5 mr-2" />
                  Complete Profile
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
