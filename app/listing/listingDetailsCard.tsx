// components/ListingDetailsCard.tsx
import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Listing, Comment } from './listingPageTypes';

interface ListingDetailsCardProps {
    listing: Listing;
    isLiked: boolean;
    likesCount: number;
    comments: Comment[];
    handleLikeToggle: () => void;
    formatAvailability: (dates: string[]) => string;
    handleContactHost: (startDate: string | null, endDate: string | null) => void;
}

// ✅ Facilities (aka amenities)
const amenityIcons: Record<string, string> = {
  'washing-machine': 'mdi:washing-machine',
  'dryer': 'mdi:tumble-dryer',
  'free-parking': 'mdi:car',
  'office-desk': 'mdi:desk',
  'office-chair': 'mdi:chair-rolling',
  'monitors': 'mdi:monitor',
  'air-conditioning': 'mdi:air-conditioner',
  'heater': 'mdi:radiator',
  'WiFi': 'mdi:wifi',
};

// ✅ Features
const featureIcons: Record<string, string> = {
  'garden': 'mdi:tree',
  'backyard': 'mdi:grass',
  'mountain-view': 'mdi:mountain',
  'ocean-view': 'mdi:waves',
  'lake-view': 'mdi:waves',
  'beach-access': 'mdi:beach',
};

const ListingDetailsCard: React.FC<ListingDetailsCardProps> = ({
    listing,
    isLiked,
    likesCount,
    comments,
    handleLikeToggle,
    formatAvailability,
    handleContactHost
}) => {
    // Calendar related state and functions from page.tsx
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });
    // New state to control calendar visibility
    const [showCalendar, setShowCalendar] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const clickedDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

        // Only allow future dates
        if (clickedDate < today) {
            return; // Don't allow selection of past dates
        }

        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            // If no start date or a full range is already selected, start a new range
            setSelectedRange({ start: dateStr, end: null });
        } else if (selectedRange.start && !selectedRange.end) {
            // If only start date is selected, set end date
            if (new Date(dateStr) < new Date(selectedRange.start)) {
                // If new date is before start date, swap them
                setSelectedRange({ start: dateStr, end: selectedRange.start });
            } else {
                setSelectedRange({ ...selectedRange, end: dateStr });
            }
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
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
            const clickedDate = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPastDate = clickedDate < today;
            const isSelected = selectedRange.start === dateStr || selectedRange.end === dateStr;
            const inRange = isInRange(dateStr);

            days.push(
                <button
                    key={dateStr}
                    onClick={() => handleDateClick(day)}
                    disabled={isPastDate}
                    className={`
          p-2 text-sm rounded-lg transition-colors
          ${isPastDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
            isSelected ? 'bg-teal-600 text-white font-bold' :
                            inRange ? 'bg-teal-200 text-gray-900' :
                                'hover:bg-teal-100 text-gray-700'}
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

    // Determine if the contact host button should be enabled
    const isContactHostEnabled = selectedRange.start && selectedRange.end;
    const contactHostButtonText = selectedRange.start && selectedRange.end
        ? `Contact Host for ${selectedRange.start} to ${selectedRange.end}`
        : selectedRange.start
            ? `Select End Date (Start: ${selectedRange.start})`
            : 'Select a Date Range';


    return (
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
            <p className="text-lg text-gray-700 mb-4 flex items-center">
                <Icon icon="material-symbols:location-on-outline" className="w-5 h-5 mr-2 text-gray-600" />
                {listing.city}, {listing.country}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm mb-6">
                <span className="flex items-center">
                    <Icon icon="material-symbols:home-outline" className="w-5 h-5 mr-1" /> {listing.type}
                </span>
                {listing.roommates && listing.roommates.length > 0 && (
                    <span className="flex items-center">
                        <Icon icon="material-symbols:group-outline" className="w-5 h-5 mr-1" />
                        Roommates: {listing.roommates.join(', ')}
                    </span>
                )}
            </div>

            {/* "Select Dates" button to toggle calendar visibility */}
            <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest-medium text-sm mb-4"
            >
                {showCalendar ? 'Hide Calendar' : 'Select Dates / Check Availability'}
            </button>

            {/* Calendar Integration - Conditionally rendered */}
            {showCalendar && (
                <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow-sm mb-6">
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

                    {/* Display selected range or prompt */}
                    <div className="text-xs sm:text-sm text-gray-600 mt-2">
                        {selectedRange.start && selectedRange.end ? (
                            <span>Selected from <strong>{selectedRange.start}</strong> to <strong>{selectedRange.end}</strong></span>
                        ) : selectedRange.start ? (
                            <span>Please select an end date. Current start date: <strong>{selectedRange.start}</strong></span>
                        ) : (
                            <span>Please select a date range.</span>
                        )}
                    </div>
                </div>
            )}

            { isContactHostEnabled ? (<button
                onClick={() => handleContactHost(selectedRange.start, selectedRange.end)}
                className={`ml-0 mt-4 px-4 py-2 text-white rounded-lg text-sm w-full
                bg-forest hover:bg-pine' : 'bg-gray-400 cursor-not-allowed`}
     
            >
                {contactHostButtonText}
            </button>) : ''}
            

            {/* Like and Comment counts */}
            <div className="flex items-center gap-4 text-gray-700 my-6">
                <button onClick={handleLikeToggle} className="flex items-center space-x-1 focus:outline-none">
                    <Icon
                        icon={isLiked ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'}
                        className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    />
                    <span className="text-base font-medium">{likesCount} Likes</span>
                </button>
                <div className="flex items-center space-x-1">
                    <Icon icon="material-symbols:chat-bubble-outline" className="w-6 h-6 text-gray-500" />
                    <span className="text-base font-medium">
                        {comments.length + comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0)} Comments
                    </span>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{listing.details}</p>

            {/* Amenities */}
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>Facilities</h2>
            {listing.amenities.map((amenity, index) => {
                const icon = amenityIcons[amenity];
                return (
                    <div key={index} className="flex items-center space-y-3 text-gray-700">
                        <Icon icon={icon} className="w-6 h-6 mr-3 text-forest" />
                        <span>{amenity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                );
            })}


            {/* Features */}
            <h2 className='text-2xl font-semibold text-gray-900 mb-3 mt-3'>Features</h2>
            {listing.features.map((feature, index) => {
                const icon = featureIcons[feature];
                return (
                    <div key={index} className="flex items-center space-y-3 text-gray-700">
                        <Icon icon={icon} className="w-6 h-6 mr-3 text-forest" />
                        <span>{feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                );
            })}

            {/* Pets Allowed */}
            {listing.petTypes && listing.petTypes.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-3">This Listing's Furry Residents</h2>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {listing.petTypes.includes('dogs') && (
                            <span className="flex items-center text-sm text-forest bg-forest-light px-3 py-1 rounded-full">
                                <Icon icon="mdi:dog" className="w-5 h-5 mr-2" />
                                Dogs
                            </span>
                        )}
                        {listing.petTypes.includes('cats') && (
                            <span className="flex items-center text-sm text-forest bg-forest-light px-3 py-1 rounded-full">
                                <Icon icon="mdi:cat" className="w-5 h-5 mr-2" />
                                Cats
                            </span>
                        )}
                        {listing.petTypes
                            .filter(p => p !== 'dogs' && p !== 'cats')
                            .map((pet, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center text-sm text-forest bg-forest-light px-3 py-1 rounded-full"
                                >
                                    <Icon icon="mdi:paw" className="w-5 h-5 mr-2" />
                                    {pet.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            ))}
                    </div>
                </>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
                <>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3 mt-3">Tags</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {[...new Set(listing.tags)].map((tag, index) => {
                            const normalized = tag.toLowerCase();
                            const tagClass = normalized.includes('women')
                                ? 'bg-purple-100 text-purple-700'
                                : normalized.includes('pet')
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-blue-100 text-blue-700';

                            return (
                                <span key={index} className={`px-3 py-1 text-sm rounded-full ${tagClass}`}>
                                    {tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ListingDetailsCard;