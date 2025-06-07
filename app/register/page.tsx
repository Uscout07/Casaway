// app/profile-setup/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';

interface ProfileFormData {
  username: string;
  name: string;
  phone: string;
  city: string;
  country: string;
  profilePic: string;
}

interface LocationData {
  city: string;
  country: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ProfileSetupPage = () => {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    name: '',
    phone: '',
    city: '',
    country: '',
    profilePic: ''
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();

  // Get user data from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        username: user.username || ''
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = {
        id: Date.now(),
        file: file,
        url: e.target?.result as string,
        name: file.name
      };
      setSelectedImage(imageData);
      setFormData(prev => ({
        ...prev,
        profilePic: imageData.url
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleImageUpload(event.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setFormData(prev => ({
      ...prev,
      profilePic: ''
    }));
  };

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Using OpenStreetMap Nominatim API for reverse geocoding (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const country = data.address?.country || '';
            
            setFormData(prev => ({
              ...prev,
              city,
              country
            }));
            setSuccess('Location detected successfully!');
          } else {
            throw new Error('Failed to get location details');
          }
        } catch (err) {
          console.error('Error fetching location:', err);
          setError('Failed to detect location. Please enter manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Failed to get your location. Please ensure location access is enabled.');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    // Username validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/users/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to complete profile');
      }

      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccess('Profile completed successfully!');
      
      // Redirect to main app after a short delay
      setTimeout(() => {
        router.push('/chat'); // or wherever you want to redirect
      }, 1500);

    } catch (err: any) {
      console.error('Error completing profile:', err);
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip profile setup and go to main app
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-ambient flex items-center justify-center px-6 py-8 pt-[10vh]">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="material-symbols:person-outline" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us a bit about yourself to get started
          </p>
        </div>

        {/* Main Form */}
        <div className="rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-row gap-8">
            
            {/* Left Side - Profile Image Upload */}
            <div className="w-1/3 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Picture</h3>
              
              <div 
                className={`relative w-64 h-64 rounded-lg border-2 border-dashed bg-white transition-colors ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-300 hover:border-teal-400'
                } flex flex-col items-center justify-center cursor-pointer`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImage.url}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-coral text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Icon icon="material-symbols:upload-rounded" className="w-12 h-12 text-forest mb-3" />
                    <p className="text-gray-600 text-center mb-2">
                      {dragActive ? 'Drop image here' : 'Upload Profile Picture'}
                    </p>
                    <p className="text-sm text-gray-500 text-center">
                      Drag & drop or click to select
                    </p>
                  </>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {selectedImage && (
                <p className="text-sm text-gray-600 mt-2">{selectedImage.name}</p>
              )}
            </div>

            {/* Right Side - Form Fields */}
            <div className="w-2/3 space-y-6">
              
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Icon
                    icon="material-symbols:alternate-email"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
                    placeholder="Choose a unique username"
                    required
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <Icon
                    icon="material-symbols:person-outline"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Icon
                    icon="material-symbols:phone-outline"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Location</h4>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center px-3 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors disabled:opacity-50"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Icon icon="eos-icons:loading" className="w-4 h-4 mr-2" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Icon icon="material-symbols:my-location" className="w-4 h-4 mr-2" />
                        Detect Location
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <Icon
                        icon="material-symbols:location-city-outline"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      />
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
                        placeholder="Your city"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <Icon
                        icon="material-symbols:public"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      />
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-forest"
                        placeholder="Your country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Icon icon="material-symbols:error-outline" className="w-5 h-5 text-coral mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Icon icon="material-symbols:check-circle-outline" className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">{success}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Skip for Now
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-forest text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;