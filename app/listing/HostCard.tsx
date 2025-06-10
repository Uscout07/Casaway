// components/hostCard.tsx
import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { User } from './listingPageTypes'; // Assuming you create a types.ts file

interface HostCardProps {
    user: User;
}

const HostCard: React.FC<HostCardProps> = ({ user }) => {
    return (
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit sticky top-28">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meet your Host</h2>
            {user ? (
                <Link href={`/profile/${user._id}`} passHref>
                    <div className="flex items-center mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-forest">
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user.name}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            ) : (
                                <Icon icon="material-symbols:person-outline" className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                            <p className="text-gray-600 text-sm">@{user.username}</p>
                        </div>
                    </div>
                </Link>
            ) : (
                <p className="text-gray-600">Host information not available.</p>
            )}

            <p className="text-gray-700 text-sm mb-4">
                {user?.name} is a verified host on Casway, committed to providing great stays.
            </p>
            <button
                onClick={() => { /* Implement chat functionality */ }}
                className="w-full bg-forest text-white px-6 py-3 rounded-full font-medium hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
            >
                <Icon icon="material-symbols:chat-outline" className="w-5 h-5" />
                Message Host
            </button>
        </div>
    );
};

export default HostCard;