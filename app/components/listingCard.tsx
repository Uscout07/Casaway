// app/components/listingCard.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Listing } from '../types'; // Make sure this path is correct based on your file structure

interface ListingCardProps {
    listing: Listing; // This `Listing` must be the one imported from `../types`
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const tempUserId = "mock-logged-in-user-id";
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
        e.preventDefault();
        e.stopPropagation();

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

    const formatAvailability = (availability: { startDate: string; endDate: string }[]) => {
      if (!availability || availability.length === 0) return 'No dates specified';
      const firstPeriod = availability[0];
      // Handle potential invalid dates from backend
      try {
        const start = new Date(firstPeriod.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(firstPeriod.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
      } catch (e) {
        console.error("Error parsing availability dates:", e);
        return "Invalid Dates";
      }
    };


    return (
        <Link href={`/listing/${listing._id}`} passHref>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-full flex flex-col">
                <div className="relative flex-shrink-0 w-full h-48 rounded-t-xl overflow-hidden">
                    <img
                        src={listing.thumbnail || listing.images?.[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'}
                        alt={listing.title}
                        width={300}
                        height={192}
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
                        <div className="flex space-x-2 text-gray-500 text-sm">
                            <span className="flex items-center">
                                <Icon icon="material-symbols:calendar-today-outline" className="w-4 h-4 mr-1" />
                                {formatAvailability(listing.availability)}
                            </span>
                           
                        </div>
                        <div className="flex space-x-2">
                            <button aria-label="Favorite listing" onClick={handleLikeToggle} className="p-1 rounded-full hover:bg-gray-100">
                                <Icon
                                    icon={isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                                    className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                />
                            </button>
                            {likesCount > 0 && <span className="text-sm text-gray-600">{likesCount}</span>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end items-end mt-auto">
                        {listing.type && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {listing.type}
                            </span>
                        )}
                        {listing.tags.includes('live-with-family') && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                Live with Family
                            </span>
                        )}
                        {listing.tags.includes('women-only') && (
                            <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                                Women Only
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;