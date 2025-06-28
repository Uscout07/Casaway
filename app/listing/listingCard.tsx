// components/ListingDetailsCard.tsx
import React from 'react';
import { Icon } from '@iconify/react';
import { Listing, Comment } from './listingPageTypes';

interface ListingDetailsCardProps {
    listing: Listing;
    isLiked: boolean;
    likesCount: number;
    comments: Comment[];
    handleLikeToggle: () => void;
    formatAvailability: (dates: string[]) => string;
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
}) => {
    const totalCommentsCount =
        comments.length + comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0);

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
                <span className="flex items-center">
                    <Icon icon="material-symbols:calendar-today-outline" className="w-5 h-5 mr-1" />
                    {formatAvailability(listing.availability)}
                </span>
            </div>

            {/* Like and Comment counts */}
            <div className="flex items-center gap-4 text-gray-700 mb-6">
                <button onClick={handleLikeToggle} className="flex items-center space-x-1 focus:outline-none">
                    <Icon
                        icon={isLiked ? 'material-symbols:favorite' : 'material-symbols:favorite-outline'}
                        className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                    />
                    <span className="text-base font-medium">{likesCount} Likes</span>
                </button>
                <div className="flex items-center space-x-1">
                    <Icon icon="material-symbols:chat-bubble-outline" className="w-6 h-6 text-gray-500" />
                    <span className="text-base font-medium">{totalCommentsCount} Comments</span>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{listing.details}</p>

            {/* Amenities */}
            <h2 className='text-2xl font-semibold text-gray-900 mb-3'>Faclities</h2>
            {listing.amenities.map((amenity, index) => {
                const icon = amenityIcons[amenity]
                return (
                    <div>
                    <div key={index} className="flex items-center space-y-3 text-gray-700">
                        <Icon icon={icon} className="w-6 h-6 mr-3 text-forest" />
                        <span>{amenity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    </div>
                );
            })}


            {/* Features */}
             <h2 className='text-2xl font-semibold text-gray-900 mb-3 mt-3'>Features</h2>
            {listing.features.map((feature, index) => {
                const icon = featureIcons[feature];
                return (
                    <div className=''>
                    <div key={index} className="flex items-center space-y-3 text-gray-700">
                        <Icon icon={icon} className="w-6 h-6 mr-3 text-forest" />
                        <span>{feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
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
                        {listing.tags.map((tag, index) => {
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
