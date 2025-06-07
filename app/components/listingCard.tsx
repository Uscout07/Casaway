import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
// import Image from 'next/image'; // Remove this line if not using next/image

// Ensure Listing interface is up-to-date with backend
interface Listing {
    _id: string;
    title: string;
    details: string;
    type: 'Single Room' | 'Whole Apartment' | 'Whole House';
    amenities: string[];
    city: string;
    country: string;
    roommates: string[];
    tags: string[];
    availability: string[];
    images: string[];
    thumbnail: string;
    user: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface ListingCardProps {
    listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

    useEffect(() => {
        // Implement logic to get loggedInUserId (e.g., from context, local storage)
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, you'd verify/decode the token or fetch /api/users/me
            // For now, a placeholder:
            const tempUserId = "mock-logged-in-user-id"; // Replace with actual logic
            setLoggedInUserId(tempUserId);
        }

        const fetchLikeStatusAndCount = async () => {
            if (!loggedInUserId || !listing._id) return;

            try {
                const statusRes = await fetch(`${API_BASE_URL}/api/likes/status/${listing._id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (statusRes.ok) {
                    const data = await statusRes.json();
                    setIsLiked(data.isLiked && data.itemType === 'listing');
                }

                const countRes = await fetch(`${API_BASE_URL}/api/likes/count/listing/${listing._id}`);
                if (countRes.ok) {
                    const data = await countRes.json();
                    setLikesCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching like status/count for listing:', error);
            }
        };
        fetchLikeStatusAndCount();
    }, [listing._id, API_BASE_URL, loggedInUserId]);

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to listing detail page
        e.stopPropagation(); // Stop event propagation

        if (!loggedInUserId) {
            alert('Please log in to like listings.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/listing/${listing._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
                setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling listing like:', error);
            alert('An unexpected error occurred.');
        }
    };

    return (
        <Link href={`/listing/${listing._id}`} passHref>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col">
                <div className="relative flex-shrink-0 w-full h-48 rounded-t-xl overflow-hidden">
                    <img
                        src={listing.thumbnail || listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                        alt={listing.title}
                        // Add explicit width and height for the img tag
                        width={300} // **Example width, adjust based on your design**
                        height={192} // **Example height (h-48 -> 192px), adjust based on your design**
                        className="rounded-t-xl object-cover w-full h-full"
                    />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                        <Icon icon="material-symbols:location-on-outline" className="w-4 h-4 mr-1" />
                        <span>{listing.city}, {listing.country}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                            <Icon icon="material-symbols:calendar-today-outline" className="w-5 h-5 text-gray-400" />
                            <Icon icon="material-symbols:door-open-outline" className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex space-x-2">
                            {/* Like Button for Listing Card */}
                            <button aria-label="Favorite listing" onClick={handleLikeToggle} className="p-1 rounded-full hover:bg-gray-100">
                                <Icon
                                    icon={isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                                    className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                />
                            </button>
                            {likesCount > 0 && <span className="text-sm text-gray-600">{likesCount}</span>} {/* Display likes count */}
                        </div>
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {listing.type}
                        </span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {listing.tags.includes('live-with-family')
                                ? 'Live with Family'
                                : listing.tags.includes('women-only')
                                ? 'Women Only'
                                : listing.type === 'Single Room'
                                ? 'Private Room'
                                : 'Entire Place'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;