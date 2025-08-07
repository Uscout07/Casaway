// app/components/ProfileLoadingSkeleton.tsx
import React from 'react';

const ProfileLoadingSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen pt-[10vh] bg-ambient w-full">
            <div className="animate-pulse flex flex-col items-center justify-center py-10">
                {/* Header Skeleton */}
                <div className="w-screen flex flex-col lg:flex-row items-center justify-evenly mb-12">
                    <div className="flex flex-col items-center w-[30%] leading-tight">
                        <div className="w-48 h-48 bg-gray-200 rounded-full mb-6"></div>
                        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
                        <div className="h-10 bg-gray-200 rounded-full w-48"></div>
                    </div>
                    <div className="flex flex-col w-[630px] mt-8 lg:mt-0">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded mb-8 w-3/4"></div>
                        <div className="flex gap-6 justify-center lg:justify-start">
                            <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                            <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                            <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                        </div>
                    </div>
                </div>

                {/* Listings Section Skeleton */}
                <div className="px-20 mx-auto pt-10 w-full max-w-7xl">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm h-[300px] flex flex-col">
                                <div className="w-full h-48 bg-gray-200 rounded-t-xl flex-shrink-0"></div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Posts Section Skeleton */}
                <div className="px-20 mx-auto py-10 w-full max-w-7xl">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-10">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLoadingSkeleton;