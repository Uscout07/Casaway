// components/ListingDetailSkeleton.tsx
import React from 'react';
import { Icon } from '@iconify/react'; // Assuming Icon is still needed for skeleton, if not, remove

const ListingDetailSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter pb-12 animate-pulse">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Gallery Section Skeleton */}
                <div className="mb-8">
                    <div className="w-full h-[500px] rounded-xl bg-gray-300 shadow-lg mb-4 relative overflow-hidden">
                        {/* Shimmer effect for main image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 animate-shimmer"></div>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="w-24 h-24 rounded-lg bg-gray-300 border-2 border-gray-200 relative overflow-hidden">
                                {/* Shimmer effect for thumbnails */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 animate-shimmer"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Listing Details and Host Info Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
                        {/* Title */}
                        <div className="h-9 bg-gray-300 rounded w-3/4 mb-4"></div>
                        {/* Location */}
                        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>

                        {/* Property info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                            <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                        </div>

                        {/* Likes and Comments count */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-6 bg-gray-300 rounded w-24"></div>
                            <div className="h-6 bg-gray-300 rounded w-28"></div>
                        </div>

                        <hr className="my-6 border-gray-200" />

                        {/* Description */}
                        <div className="h-7 bg-gray-300 rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-11/12 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6 mb-6"></div>

                        {/* Amenities */}
                        <div className="h-7 bg-gray-300 rounded w-1/3 mb-3"></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-5 bg-gray-300 rounded w-full"></div>
                            ))}
                        </div>

                        {/* Tags/Features */}
                        <div className="h-7 bg-gray-300 rounded w-1/4 mb-3"></div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                            <div className="h-6 bg-gray-300 rounded-full w-24"></div>
                        </div>

                        {/* Comments Section Skeleton */}
                        <hr className="my-6 border-gray-200" />
                        <div className="h-7 bg-gray-300 rounded w-1/4 mb-4"></div>
                        <div className="flex gap-2 mb-6">
                            <div className="flex-1 h-10 bg-gray-300 rounded-lg"></div>
                            <div className="h-10 w-20 bg-gray-300 rounded-lg"></div>
                        </div>
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="flex items-start space-x-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Host Card Skeleton */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit sticky top-28">
                        <div className="h-7 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gray-300 mr-4"></div>
                            <div>
                                <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
                        <div className="h-12 bg-gray-300 rounded-full w-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailSkeleton;