'use client';
import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

type Listing = {
  _id: string;
  title: string;
  thumbnail: string;
  city: string;
  country: string;
  status: 'draft' | 'published';
};

type UserListingsSectionProps = {
  listings: Listing[];
  loading: boolean;
  onDeleteListing: (listingId: string) => void;
  onShowDeleteConfirm: (confirmDetails: { type: 'listing'; id: string } | null) => void;
  onEditListing: (listingId: string) => void; // New prop for editing
};

const UserListingsSection: React.FC<UserListingsSectionProps> = ({
  listings,
  loading,
  onDeleteListing,
  onShowDeleteConfirm,
  onEditListing, // Destructure new prop
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-600">Loading listings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-forest">My Listings</h2>
        <Link href="/UploadListingPage" passHref>
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Icon icon="mdi:plus" className="w-5 h-5" />
            <span>Add New Listing</span>
          </button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-600 text-center py-8">You haven't created any listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
                {listing.thumbnail ? (
                  <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="mdi:image-off" className="w-16 h-16 text-gray-400" />
                )}
                {listing.status === 'draft' && (
                  <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">Draft</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{listing.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{listing.city}, {listing.country}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditListing(listing._id)} // Call new prop on click
                    className="text-forest/90 hover:text-forest transition-colors"
                  >
                    <Icon icon="mdi:pencil" className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onShowDeleteConfirm({ type: 'listing', id: listing._id })}
                    className="text-coral hover:text-red-800 transition-colors"
                  >
                    <Icon icon="mdi:delete" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListingsSection;