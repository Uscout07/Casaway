// app/components/listingCard.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Listing } from '../types'; // Make sure this path is correct based on your file structure

interface ListingCardProps {
    listing: Listing; // This `Listing` must be the one imported from `../types`
}

// --- NEW: ListingCardSkeleton Component ---
export const ListingCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm h-full flex flex-col overflow-hidden animate-pulse">
            {/* Image Placeholder */}
            <div className="relative flex-shrink-0 w-full h-48 rounded-t-xl bg-gray-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 animate-shimmer"></div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                {/* Title Placeholder */}
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                {/* Location Placeholder */}
                <div className="flex items-center text-gray-600 text-sm mb-2">
                    <div className="w-4 h-4 bg-gray-300 rounded mr-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                {/* Date & Like Placeholder */}
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-6"></div> {/* For the like button */}
                </div>
                {/* Tags Placeholder */}
                <div className="flex flex-wrap gap-2 justify-end items-end mt-auto">
                    <div className="h-6 bg-gray-300 rounded-full w-1/4"></div>
                    <div className="h-6 bg-gray-300 rounded-full w-1/5"></div>
                </div>
            </div>
        </div>
    );
};
// --- END NEW COMPONENT ---

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // NOTE: Using a mock ID here. In a real app, you'd decode the token or fetch user ID from an auth endpoint.
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
                    <div className="flex flex-wrap gap-2 justify-end items-end mt-2">
                        {listing.type && (
                            <span className="px-3 py-1  bg-gray-100 text-gray-700 text-xs rounded-full">
                                {listing.type}
                            </span>
                        )}
                        {Array.isArray(listing.tags) && listing.tags.length > 0 && (
                          <>
                            {[...new Set(listing.tags)]
                              .slice(0, 4)
                              .map((tag, i) => {
                                const normalized = tag.toLowerCase();
                                // Match mobile color scheme: women -> purple; pet -> pink; default -> blue
                                const cls = normalized.includes('women')
                                  ? 'bg-purple-100 text-purple-700'
                                  : normalized.includes('pet')
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-blue-100 text-blue-700';
                                return (
                                  <span key={i} className={`px-3 py-1 ${cls} text-xs rounded-full`}>
                                    {tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                );
                              })}
                          </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ListingCard;