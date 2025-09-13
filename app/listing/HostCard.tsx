// components/hostCard.tsx
import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { User } from './listingPageTypes'; // Assuming you create a types.ts file

interface HostCardProps {
    user: User | null; // User can be null if host info not available
    onMessageHost: () => void; // Added for message host functionality
    onViewProfile: (userId: string) => void; // Added for viewing profile
}

const HostCard: React.FC<HostCardProps> = ({ user, onMessageHost, onViewProfile }) => {
    // Format location string
    const formatLocation = () => {
        const locationParts = [];
        if (user?.city) locationParts.push(user.city);
        if (user?.country) locationParts.push(user.country);
        return locationParts.length > 0 ? locationParts.join(', ') : null;
    };

    // Extract first name from full name
    const getFirstName = (fullName: string) => {
        return fullName.split(' ')[0];
    };

    const userLocation = formatLocation();
    const locationText = userLocation ? ` from ${userLocation}` : '';
    const firstName = user?.name ? getFirstName(user.name) : 'Swapper';

    return (
        <div className="lg:col-span-1 bg-white p-6 rounded-xl h-fit sticky top-15 mx-auto w-[95%] shadow-lg"> 
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Meet your Swapper</h2>
            {user ? (
                <div 
                    onClick={() => onViewProfile(user._id)} 
                    className="flex justify-center items-center mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                > 
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-green-800 bg-gray-200 flex justify-center items-center"> 
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon icon="material-symbols:person-outline" className="w-10 h-10 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                        <p className="text-gray-600 text-sm">@{user.username}</p>
                    </div>
                </div>
            ) : (
                <p className="text-gray-600">Host information not available.</p>
            )}

            <p className="text-gray-700 text-sm mb-4 text-center">
                {user?.name || 'This swapper'}{locationText}.
            </p>
            <button
                onClick={onMessageHost}
                className="w-full bg-forest text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                <Icon icon="material-symbols:chat-bubble-outline" className="w-5 h-5" /> 
                <span>Message {firstName}</span>
            </button>
        </div>
    );
};

export default HostCard;