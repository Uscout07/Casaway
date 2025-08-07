// app/components/ListingsSection.tsx
import React from 'react';
import { Icon } from '@iconify/react';
import ListingCard from '../components/listingCard'; // Adjust path if needed
import { Listing } from '../types'; // Adjust path as necessary

interface ListingsSectionProps {
    listings: Listing[];
    listingsLoading: boolean;
    listingsError: string | null;
}

const ListingsSection: React.FC<ListingsSectionProps> = ({ listings, listingsLoading, listingsError }) => {
    return (
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-20 mx-auto py-10 max-w-screen pt-10 hidden">
            <h2 className="text-[18px] font-bold font-inter text-forest mb-6">Listings</h2>
            {listingsLoading ? (
             <div className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] auto-rows-[1fr]">
  {[...Array(8)].map((_, i) => (
    <div
      key={i}
      className="relative w-full pt-[75%] bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="w-full h-1/2 bg-gray-200 flex-shrink-0"></div>
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

            ) : listingsError ? (
                <div className="text-center py-8">
                    <Icon icon="material-symbols:error-outline" className="w-8 h-8 mb-2 mx-auto text-red-500" />
                    <p className="text-red-600">{listingsError}</p>
                </div>
            ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6 pb-2 md:pb-8 xl:pb-12">
                    {listings.map(listing => (
                        <ListingCard
                            key={listing._id}
                            listing={listing}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Icon icon="material-symbols:home-outline" className="w-12 h-12 mb-4 mx-auto text-gray-400" />
                    <p className="text-forest">No listings found</p>
                </div>
            )}
        </div>
    );
};

export default ListingsSection;