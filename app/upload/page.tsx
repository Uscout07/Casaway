// pages/UploadListingPage.tsx (or wherever your component is located)
'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import SpeedTest from '@cloudflare/speedtest';
import CreatePostForm from '../components/createPostForm'; // Import the new component
import StoryUpload from '../components/storyUpload';

// Iconify Icon Component (since Iconify React isn't available, we'll create a simple wrapper)
type IconProps = {
    icon: string;
    className?: string;
};
type CreatePostFormProps = {
    onPostCreated: () => void;
    // Add these props if you want them controlled by the parent
    initialImageUrl?: string; // Made optional as it might not always be there
    initialCountry?: string;
    initialCity?: string;
};

const UploadListingPage = () => {
    const [selectedImages, setSelectedImages] = useState<any[]>([]); // Added type for selectedImages
    const [listingType, setListingType] = useState('');
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]); // Added type
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); // Added type
    const [customFacilities, setCustomFacilities] = useState('');
    const [customFeatures, setCustomFeatures] = useState('');
    const [livingWith, setLivingWith] = useState<string[]>([]);
    const [roommateDetails, setRoommateDetails] = useState({
        count: '',
        gender: '',
    });
    // Added type
    const [petTypes, setPetTypes] = useState<string[]>([]); // Added type
    const [customPets, setCustomPets] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'listing' | 'post' | 'story'>('listing'); // New state for view mode
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const [wifiDownloadSpeed, setWifiDownloadSpeed] = useState<number | ''>('');
    const [wifiUploadSpeed, setWifiUploadSpeed] = useState<number | ''>(''); // Corrected: wifiUploadSpeed state variable
    const [formData, setFormData] = useState({
        title: '',
        details: '',
        country: '',
        city: '',
        type: '',
        amenities: [] as string[], // Explicitly type as string array
        tags: [] as string[],       // Explicitly type as string array
        availability: [] as string[], // Explicitly type as string array
        images: [] as string[],     // Explicitly type as string array
        thumbnail: '',
        status: 'draft'
    });

    const facilities = [
        { id: 'washing-machine', name: 'Washing Machine', icon: 'mdi:washing-machine' },
        { id: 'dryer', name: 'Dryer', icon: 'mdi:tumble-dryer' },
        { id: 'free-parking', name: 'Free Parking', icon: 'mdi:car' },
        { id: 'office-desk', name: 'Office Desk', icon: 'mdi:desk' },
        { id: 'office-chair', name: 'Office Chair', icon: 'mdi:chair-rolling' },
        { id: 'monitors', name: 'Monitors', icon: 'mdi:monitor' },
        { id: 'air-conditioning', name: 'Air Conditioning', icon: 'mdi:air-conditioner' }, // Added air-conditioning
        { id: 'heater', name: 'Heater', icon: 'mdi:radiator' }, // Added heater
        { id: 'wifi', name: 'Wi-Fi', icon: 'mdi:wifi' }, // Added Wi-Fi
    ];

    const features = [
        { id: 'garden', name: 'Garden', icon: 'mdi:tree' },
        { id: 'backyard', name: 'Backyard', icon: 'mdi:grass' },
        { id: 'mountain-view', name: 'Mountain View', icon: 'mdi:mountain' },
        { id: 'ocean-view', name: 'Ocean View', icon: 'mdi:waves' },
        { id: 'lake-view', name: 'Lake View', icon: 'mdi:waves' },
        { id: 'beach-access', name: 'Beach Access', icon: 'mdi:beach' },
    ];

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

  
const testWifiSpeed = (): Promise<{ download: number; upload: number }> => {
  return new Promise((resolve) => {
    const speedtest = new SpeedTest();

    speedtest.onFinish = (results) => {
      const downloadBits = results.getDownloadBandwidth() || 0;
      const uploadBits = results.getUploadBandwidth() || 0;

      const downloadMbps = downloadBits / 1_000_000;
      const uploadMbps = uploadBits / 1_000_000;

      resolve({
        download: parseFloat(downloadMbps.toFixed(2)),
        upload: parseFloat(uploadMbps.toFixed(2)),
      });
    };

    speedtest.onError = (err) => {
      console.error('Speed test failed:', err);
      resolve({ download: 0, upload: 0 });
    };

    speedtest.play(); // Starts the test
  });
};





    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const modeFromUrl = params.get('mode');

        if (modeFromUrl === 'story') setViewMode('story');
        else if (modeFromUrl === 'post') setViewMode('post');
        else setViewMode('listing');

        // Auto-run speed test on load
        testWifiSpeed().then(({ download, upload }) => { // Destructure both download and upload
            console.log('[testWifiSpeed] Download Speed:', download, 'Mbps');
            console.log('[testWifiSpeed] Upload Speed:', upload, 'Mbps');
            setWifiDownloadSpeed(download);
            setWifiUploadSpeed(upload); // Set upload speed
        });
    }, []);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const files = Array.from(event.target.files);
        if (selectedImages.length + files.length > 10) {
            alert('Maximum 10 images allowed');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = {
                    id: Date.now() + Math.random(),
                    file: file,
                    url: e.target?.result as string, // Cast to string
                    name: file.name
                };
                setSelectedImages(prev => [...prev, newImage]);
            };
            reader.readAsDataURL(file);
        });
    };


    const removeImage = (imageId: number) => { // Added type for imageId
        setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSpaceTypeSelect = (type: string) => { // Added type for type
        setListingType(type);
        setFormData(prev => ({ ...prev, type }));
    };

    const handleFacilityToggle = (facilityId: string) => { // Added type
        setSelectedFacilities(prev =>
            prev.includes(facilityId)
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId]
        );
    };

    const handleFeatureToggle = (featureId: string) => { // Added type
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        );
    };

    const handleLivingWithToggle = (option: string) => { // Added type
        setLivingWith(prev =>
            prev.includes(option)
                ? prev.filter(item => item !== option)
                : [...prev, option]
        );
    };

    const handlePetTypeToggle = (petType: string) => { // Added type
        setPetTypes(prev =>
            prev.includes(petType)
                ? prev.filter(type => type !== petType)
                : [...prev, petType]
        );
    };


    const getDaysInMonth = (month: number, year: number) => { // Added types
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => { // Added types
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            setSelectedRange({ start: dateStr, end: null });
        } else if (selectedRange.start && !selectedRange.end) {
            if (new Date(dateStr) < new Date(selectedRange.start)) {
                setSelectedRange({ start: dateStr, end: selectedRange.start });
            } else {
                setSelectedRange({ ...selectedRange, end: dateStr });
            }
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => { // Added type
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
            } else {
                setCurrentMonth(prev => prev - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
            } else {
                setCurrentMonth(prev => prev + 1);
            }
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedRange.start === dateStr || selectedRange.end === dateStr;
            const inRange = isInRange(dateStr);

            days.push(
                <button
                    key={dateStr}
                    onClick={() => handleDateClick(day)}
                    className={`
          p-2 text-sm rounded-lg transition-colors
          ${isSelected ? 'bg-forest text-white font-bold' :
                            inRange ? 'bg-mint text-gray-900' :
                                'hover:bg-forest-light text-gray-700'}
        `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const getDateRangeArray = (start: string, end: string): string[] => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const range: string[] = [];

        for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
        ) {
            range.push(new Date(d).toISOString().split('T')[0]);
        }

        return range;
    };

    const isInRange = (dateStr: string) => {
        if (!selectedRange.start || !selectedRange.end) return false;
        const date = new Date(dateStr);
        return date >= new Date(selectedRange.start) && date <= new Date(selectedRange.end);
    };

    const handleSubmitListing = async (status: 'draft' | 'published') => {
        setIsLoading(true); // Start loading state

        // 1. Retrieve the token using the correct key 'token'
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        // Add a log to confirm the token value right before the check
        console.log('[handleSubmitListing] Token retrieved:', token ? 'Token found' : 'No token found');

        if (!token) {
            alert('Please log in to create a listing');
            setIsLoading(false); // Stop loading if no token
            return; // Exit function if no token
        }

        // 2. Define all listing data *before* the fetch call
        const availability = selectedRange.start && selectedRange.end
            ? getDateRangeArray(selectedRange.start, selectedRange.end)
            : [];

        const amenities = [
            ...selectedFacilities,
            ...(customFacilities ? [customFacilities] : [])
        ];

        const features = [
            ...selectedFeatures,
            ...(customFeatures ? [customFeatures] : [])
        ];

        const tags = [];
        if (livingWith.includes('family')) tags.push('Family');
        if (livingWith.includes('roommates-women') || livingWith.includes('females-only')) tags.push('Women Only');
        if (listingType === 'Single Room') {
            if (livingWith.includes('family')) tags.push('Family');
            if (livingWith.includes('roommates-women')) tags.push('Women Only');
            if (livingWith.includes('pets')) {
                tags.push('Pets Allowed');
                tags.push(...petTypes);
                if (customPets) tags.push(customPets);
            }
        }
        const imageUrls = selectedImages.map(img => img.url);

        const roommates = [];

        if (livingWith.includes('family')) roommates.push('Family');
        if (livingWith.includes('roommates-women')) roommates.push('Roommates - Women Only');
        if (livingWith.includes('roommates') && (roommateDetails.count || roommateDetails.gender)) {
            roommates.push(`Roommates: ${roommateDetails.count} (${roommateDetails.gender})`);
        }
        if (livingWith.includes('females-only')) tags.push('women-only');

        const wifiSpeedData = {
            download: typeof wifiDownloadSpeed === 'number' ? wifiDownloadSpeed : 0,
            upload: typeof wifiUploadSpeed === 'number' ? wifiUploadSpeed : 0,
        };

        const listingData = {
            title: formData.title,
            details: formData.details,
            type: listingType,
            amenities,
            features,
            city: formData.city,
            country: formData.country,
            tags,
            availability,
            images: imageUrls,
            thumbnail: imageUrls[thumbnailIndex] || imageUrls[0] || '',
            status,
            roommates,
            petTypes,
            wifiSpeed: wifiSpeedData,

        };


        try {
            console.log('[handleSubmitListing] Submitting listing data:', listingData);
            console.log('[handleSubmitListing] Authorization Token:', token); // Log the token here

            // 3. Perform the fetch request with correct URL and headers
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing`, { // Corrected: '/api/listing' (singular)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Ensure token is correctly added
                },
                body: JSON.stringify(listingData),
            });

            const result = await response.json();
            console.log('[handleSubmitListing] API Response:', result);

            if (response.ok) {
                alert(`Listing ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
                console.log('✅ Listing created:', result);
                // Optionally, clear form or redirect after successful submission
                // router.push('/dashboard'); // Example: redirect to dashboard
            } else {
                console.error('[handleSubmitListing] API Error:', result);
                alert(result.msg || result.error || 'Error submitting listing. Please try again.');
            }

        } catch (error) {
            console.error('[handleSubmitListing] Network or unexpected Error:', error);
            alert('Network error or unexpected issue. Please check your connection and try again.');
        } finally {
            setIsLoading(false); // Always stop loading, regardless of success or error
        }
    };

    const handlePostCreated = () => {
        // Optional: Reset form fields or show a success message
        // For this example, we just show an alert in CreatePostForm
    };



    return (
        <div className="min-h-screen bg-ambient font-inter pt-[8vh] sm:pt-[10vh] px-3 sm:px-4 md:px-6 lg:px-8">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl py-3 sm:py-4 md:py-6 lg:py-8 font-bold text-forest text-center">
                {viewMode === 'listing' ? 'Upload Listing' : viewMode === 'post' ? 'Create Post' : 'Create Story'}
            </h1>

            {/* Toggle Buttons */}
            <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
                <div className="relative inline-flex rounded-full overflow-hidden bg-forest-medium p-1 w-full max-w-xl sm:max-w-3xl">
                    <button
                        onClick={() => setViewMode('listing')}
                        className={`py-2 sm:py-3 px-3 sm:px-4 md:px-6  rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors z-10 flex-1 text-center hidden
                        ${viewMode === 'listing' ? 'text-white bg-forest' : 'text-white'}`}
                    >
                        <span className="hidden sm:inline">Create a Listing</span>
                        <span className="sm:hidden">Listing</span>
                    </button>
                    <button
                        onClick={() => setViewMode('post')}
                        className={`py-2 sm:py-3 px-3 sm:px-4 md:px-6 lg:px-8 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors z-10 flex-1 text-center
                        ${viewMode === 'post' ? 'text-white bg-forest' : 'text-white'}`}
                    >
                        <span className="hidden sm:inline">Create a Post</span>
                        <span className="sm:hidden">Post</span>
                    </button>
                    <button
                        onClick={() => setViewMode('story')}
                        className={`py-2 sm:py-3 px-3 sm:px-4 md:px-6 lg:px-8 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-colors z-10 flex-1 text-center
                        ${viewMode === 'story' ? 'text-white bg-forest' : 'text-white'}`}
                    >
                        <span className="hidden sm:inline">Create a Story</span>
                        <span className="sm:hidden">Story</span>
                    </button>
                </div>
            </div>

            {viewMode === 'listing' ? (
                <div className="flex flex-col xl:flex-row xl:justify-center xl:gap-8 2xl:gap-12 max-w-7xl mx-auto">
                    {/* Left Column - Images and Calendar */}
                    <div className="w-full max-w-[400px] xl:w-2/5 2xl:w-1/3 flex flex-col space-y-4 sm:space-y-6 mb-6 xl:mb-0">
                        {/* Image Upload Section */}
                        <div className="bg-white w-full aspect-square rounded-lg p-6 flex flex-col items-center justify-center text-center relative border-2 border-dashed border-forest-medium hover:border-forest-green transition-colors cursor-pointer">
                            <Icon icon="material-symbols:upload-rounded" className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-forest-medium mx-auto mb-3 sm:mb-4" />
                            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">Drag & Drop or Click to Upload Images (Max 10)</p>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="absolute inset-0 z-20 cursor-pointer"
                            >
                            </label>
                        </div>

                        {/* Selected Images Display */}
                        {selectedImages.length > 0 && (
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Selected Images ({selectedImages.length}/10):</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-3 gap-2 sm:gap-3">
                                    {selectedImages.map((image, index) => (
                                        <div key={image.id} className="relative group">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className={`w-full h-14 sm:h-16 md:h-20 object-cover rounded-lg border-2 ${thumbnailIndex === index ? 'border-forest' : 'border-transparent'
                                                    } cursor-pointer`}
                                                onClick={() => setThumbnailIndex(index)}
                                            />
                                            <button
                                                onClick={() => removeImage(image.id)}
                                                className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-coral text-white rounded-full p-1 hover:bg-coral-dark transition-colors z-10"
                                            >
                                                <Icon icon="mdi:close" className="w-2 h-2 sm:w-3 sm:h-3" />
                                            </button>
                                            {thumbnailIndex === index && (
                                                <span className="absolute bottom-0 left-0 bg-forest text-white text-xs px-1 sm:px-2 py-1 rounded-tr-lg">
                                                    Thumbnail
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calendar with Range Selection */}
                        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Select Availability</h3>
                            <div className="mb-3 sm:mb-4">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <button onClick={() => navigateMonth('prev')} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100">
                                        <Icon icon="mdi:chevron-left" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    </button>
                                    <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium">{monthNames[currentMonth]} {currentYear}</h4>
                                    <button onClick={() => navigateMonth('next')} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100">
                                        <Icon icon="mdi:chevron-right" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                        <div key={`${day}-${index}`} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {renderCalendar()}
                                </div>
                            </div>

                            {selectedRange.start && selectedRange.end && (
                                <div className="text-xs sm:text-sm text-gray-600 mt-2">
                                    Selected from <strong>{selectedRange.start}</strong> to <strong>{selectedRange.end}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="w-full xl:w-3/5 2xl:w-2/3 space-y-4 sm:space-y-6">
                        {/* Space Type Selection */}
                        <div className="rounded-lg p-3 sm:p-4 md:p-6">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">What type of space do you want to list?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <button
                                    onClick={() => handleSpaceTypeSelect('Single Room')}
                                    className={`p-3 sm:p-4 rounded-lg border-2 h-16 sm:h-20 md:h-24 flex bg-forest-light text-forest items-center justify-center gap-2 sm:gap-3 md:gap-4 transition-colors ${listingType === 'Single Room'
                                        ? 'border-forest-green bg-mint text-forest'
                                        : 'border-forest-light'
                                        }`}
                                >
                                    <Icon icon="mdi:guest-room-outline" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">Single Room</span>
                                </button>

                                <button
                                    onClick={() => handleSpaceTypeSelect('Whole Apartment')}
                                    className={`p-3 sm:p-4 rounded-lg border-2 h-16 sm:h-20 md:h-24 flex bg-forest-light text-forest items-center justify-center gap-2 sm:gap-3 md:gap-4 transition-colors ${listingType === 'Whole Apartment'
                                        ? 'border-forest-green bg-mint text-forest'
                                        : 'border-forest-light'
                                        }`}
                                >
                                    <Icon icon="ph:building-apartment" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">Whole Apartment</span>
                                </button>

                                <button
                                    onClick={() => handleSpaceTypeSelect('Whole House')}
                                    className={`sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-1 p-3 sm:p-4 rounded-lg border-2 h-16 sm:h-20 md:h-24 flex bg-forest-light text-forest items-center justify-center gap-2 sm:gap-3 md:gap-4 transition-colors ${listingType === 'Whole House'
                                        ? 'border-forest-green bg-mint text-forest'
                                        : 'border-forest-light'
                                        }`}
                                >
                                    <Icon icon="solar:home-linear" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold">Whole House</span>
                                </button>
                            </div>
                        </div>

                        {/* Single Room Living Arrangements */}
                        {listingType === 'Single Room' && (
                            <div className="rounded-lg p-3 sm:p-4 md:p-6">
                                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Who will your swap live with?</h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <button
                                        onClick={() => handleLivingWithToggle('family')}
                                        className={`w-full p-2 sm:p-3 rounded-lg border-2 flex items-center justify-between bg-forest-light text-forest transition-colors ${livingWith.includes('family')
                                            ? 'border-forest-green bg-mint text-forest'
                                            : 'border-forest-light'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Icon icon="mdi:account-group" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                            <span className="text-xs sm:text-sm md:text-base">Family</span>
                                        </div>
                                        {livingWith.includes('family') && (
                                            <Icon icon="mdi:check" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-forest-green" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleLivingWithToggle('roommates')}
                                        className={`w-full p-2 sm:p-3 rounded-lg border-2 flex items-center justify-between bg-forest-light text-forest transition-colors ${livingWith.includes('roommates') // Corrected to check for 'roommates'
                                            ? 'border-forest-green bg-mint text-forest'
                                            : 'border-forest-light'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Icon icon="mdi:account-group" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                            <span className="text-xs sm:text-sm md:text-base">Roommates</span>
                                        </div>
                                        {livingWith.includes('roommates') && ( // Corrected to check for 'roommates'
                                            <Icon icon="mdi:check" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-forest-green" />
                                        )}
                                    </button>

                                    {livingWith.includes('roommates') && (
                                        <div className="ml-3 sm:ml-4 space-y-2">
                                            <input
                                                type="number"
                                                placeholder="Number of roommates"
                                                value={roommateDetails.count}
                                                onChange={(e) =>
                                                    setRoommateDetails((prev) => ({ ...prev, count: e.target.value }))
                                                }
                                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Gender of roommates"
                                                value={roommateDetails.gender}
                                                onChange={(e) =>
                                                    setRoommateDetails((prev) => ({ ...prev, gender: e.target.value }))
                                                }
                                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm"
                                            />
                                            <button
                                                onClick={() => handleLivingWithToggle('females-only')}
                                                className={`w-full p-2 sm:p-3 rounded-lg border-2 flex items-center justify-between bg-forest-light text-forest transition-colors ${livingWith.includes('females-only')
                                                    ? 'border-forest-green bg-mint text-forest'
                                                    : 'border-forest-light'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Icon icon="mdi:gender-female" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                                    <span className="text-xs sm:text-sm md:text-base">Available for women only</span>
                                                </div>
                                                {livingWith.includes('females-only') && (
                                                    <Icon icon="mdi:check" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-forest-green" />
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleLivingWithToggle('pets')}
                                        className={`w-full p-2 sm:p-3 rounded-lg border-2 flex items-center justify-between bg-forest-light text-forest transition-colors ${livingWith.includes('pets')
                                            ? 'border-forest-green bg-mint text-forest'
                                            : 'border-forest-light'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Icon icon="mdi:paw" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                            <span className="text-xs sm:text-sm md:text-base">Pets</span>
                                        </div>
                                        {livingWith.includes('pets') && (
                                            <Icon icon="mdi:check" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-forest-green" />
                                        )}
                                    </button>

                                    {/* Pet Types Selection */}
                                    {livingWith.includes('pets') && (
                                        <div className="ml-3 sm:ml-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handlePetTypeToggle('dogs')}
                                                    className={`p-2 rounded-lg border-2 flex items-center gap-2 bg-forest-light text-forest transition-colors ${petTypes.includes('dogs')
                                                        ? 'border-forest-green bg-mint text-forest'
                                                        : 'border-forest-light'
                                                        }`}
                                                >
                                                    <Icon icon="mdi:dog" className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span className="text-xs sm:text-sm">Dogs</span>
                                                </button>

                                                <button
                                                    onClick={() => handlePetTypeToggle('cats')}
                                                    className={`p-2 rounded-lg border-2 flex items-center gap-2 bg-forest-light text-forest transition-colors ${petTypes.includes('cats')
                                                        ? 'border-forest-green bg-mint text-forest'
                                                        : 'border-forest-light'
                                                        }`}
                                                >
                                                    <Icon icon="mdi:cat" className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span className="text-xs sm:text-sm">Cats</span>
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Other pets (specify)"
                                                value={customPets}
                                                onChange={(e) => setCustomPets(e.target.value)}
                                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Facilities Section */}
                        <div className="rounded-lg p-3 sm:p-4 md:p-6">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Facilities</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                {facilities.map((facility) => (
                                    <button
                                        key={facility.id}
                                        onClick={() => handleFacilityToggle(facility.id)}
                                        className={`p-3 sm:p-4 rounded-lg border-2 h-16 sm:h-20 md:h-24 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-forest-light text-forest transition-colors ${selectedFacilities.includes(facility.id)
                                            ? 'border-forest-green bg-mint text-forest'
                                            : 'border-forest-light'
                                            }`}
                                    >
                                        <Icon icon={facility.icon} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                                        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-center">{facility.name}</span>
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                placeholder="Add other facilities"
                                value={customFacilities}
                                onChange={(e) => setCustomFacilities(e.target.value)}
                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            />
                        </div>

                        {/* Features Section */}
                        <div className="rounded-lg p-3 sm:p-4 md:p-6">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                {features.map((feature) => (
                                    <button
                                        key={feature.id}
                                        onClick={() => handleFeatureToggle(feature.id)}
                                        className={`p-3 sm:p-4 rounded-lg border-2 h-16 sm:h-20 md:h-24 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 bg-forest-light text-forest transition-colors ${selectedFeatures.includes(feature.id)
                                            ? 'border-forest-green bg-mint text-forest'
                                            : 'border-forest-light'
                                            }`}
                                    >
                                        <Icon icon={feature.icon} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
                                        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-center">{feature.name}</span>
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                placeholder="Add other features"
                                value={customFeatures}
                                onChange={(e) => setCustomFeatures(e.target.value)}
                                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-xs sm:text-sm"
                            />
                        </div>

                        {/* Wifi Speed Section */}
                        <div className="rounded-lg p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Wi-Fi Speed (Mbps)</h3>

                            <div className="flex flex-col gap-2">
                                {isLoading ? (
                                    <p className="text-xs text-gray-600">Testing Wi-Fi speed, please wait...</p>
                                ) : (
                                    <>
                                        <div className="text-sm text-gray-700">
                                            <strong>Download:</strong> {wifiDownloadSpeed ? `${wifiDownloadSpeed} Mbps` : 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            <strong>Upload:</strong> {wifiUploadSpeed ? `${wifiUploadSpeed} Mbps` : 'N/A'}
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={async () => {
                                        setIsLoading(true);
                                        const { download, upload } = await testWifiSpeed(); // Destructure both download and upload
                                        setWifiDownloadSpeed(download);
                                        setWifiUploadSpeed(upload); // Set upload speed
                                        setIsLoading(false);
                                    }}
                                    className="w-max px-3 py-2 text-xs sm:text-sm bg-forest text-white rounded-lg hover:bg-forest-dark transition"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Testing...' : 'Retest Wi-Fi Speed'}
                                </button>
                            </div>
                        </div>


                        {/* Basic Information */}
                        <div className="rounded-lg p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                    className="w-full p-2 sm:p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full p-2 sm:p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">Listing Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-2 sm:p-3 border-2 border-forest-light bg-ambient rounded-lg focus:ring-2 focus:ring-forest-green focus:border-forest-green text-forest text-xs sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-2">Listing Details</label>
                                <textarea
                                    rows={3}
                                    value={formData.details}
                                    onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                                    className="w-full p-2 sm:p-3 border-2 border-forest bg-forest-light rounded-lg focus:ring-2 focus:ring-forest focus:border-forest text-forest resize-none text-xs sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                            <button
                                onClick={() => handleSubmitListing('draft')}
                                disabled={isLoading}
                                className="w-full sm:flex-1 bg-gray-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
                            >
                                {isLoading ? 'Saving...' : 'Save As Draft'}
                            </button>

                            <button
                                onClick={() => handleSubmitListing('published')}
                                disabled={isLoading || !formData.title || !formData.city || !listingType}
                                className="w-full sm:flex-1 bg-teal-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                            >
                                {isLoading ? 'Publishing...' : 'Post Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : viewMode === 'post' ?
                // Render CreatePostForm when viewMode is 'post'
                <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
                    <div className="w-full max-w-4xl px-2 sm:px-0">
                        <CreatePostForm
                            initialImageUrl={selectedImages[0]?.url || ''}
                            initialCountry={formData.country}
                            initialCity={formData.city}
                            onPostCreated={handlePostCreated}
                        />
                    </div>
                </div>
                : (
                    <>
                        <StoryUpload />
                    </>
                )}
        </div>
    );
};

export default UploadListingPage;