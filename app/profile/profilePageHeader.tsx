// app/components/ProfileHeader.tsx
import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { User } from './profileTypes'; // <--- THIS IS CRUCIAL: Must import from here

interface ProfileHeaderProps {
    user: User | null;
    isMyProfile: boolean;
    isFollowing: boolean;
    followLoading: boolean;
    followersCount: number;
    postsCount: number; // Changed from listingsCount
    onFollowToggle: () => void;
    onStartChat: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    isMyProfile,
    isFollowing,
    followLoading,
    followersCount,
    postsCount, // Changed from listingsCount
    onFollowToggle,
    onStartChat,
}) => {
    return (
        <div className="text-center my-5 bg-ambient w-full px-4 sm:px-6 lg:px-10">
  <div className="max-w-screen-xl mx-auto w-full">
    <div className="flex flex-col lg:flex-row items-center justify-evenly gap-10">
      {/* Profile */}
      <div className="flex flex-col items-center w-full md:w-[30%] leading-tight">
        <div className="w-48 h-48 flex items-center justify-center rounded-full overflow-hidden mb-6 border-4 border-forest">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon icon="material-symbols:person-outline" className="w-40 h-40 text-forest" />
          )}
        </div>
        <div className="text-center flex flex-col leading-tight">
          <h2 className="text-[24px] font-bold text-forest">{user?.name}</h2>
          <p className="text-forest text-[12px]">@{user?.username}</p>
          {(user?.city || user?.country) && (
            <p className="text-forest text-[12px]">
              {user?.city}{user?.city && user?.country ? ', ' : ''}{user?.country}
            </p>
          )}
          {user?.instagramUrl && (
            <a
              href={user.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition"
            >
              <Icon icon="mdi:instagram" className="w-5 h-5" />
              Instagram
            </a>
          )}
        </div>

        {isMyProfile ? (
          <Link
            href="../settings"
            className="mt-6 flex items-center justify-center w-[300px] h-[45px] bg-forest text-white rounded-full font-medium hover:bg-teal-800 transition-colors"
          >
            Edit Profile
          </Link>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onFollowToggle}
              disabled={followLoading}
              className={`w-[145px] h-[45px] rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
                isFollowing
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-forest text-white hover:bg-teal-800'
              } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {followLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icon
                    icon={
                      isFollowing
                        ? "material-symbols:person-remove"
                        : "material-symbols:person-add"
                    }
                    className="w-4 h-4"
                  />
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </>
              )}
            </button>
            <button
              onClick={onStartChat}
              className="w-[145px] h-[45px] bg-forest text-white rounded-full font-medium hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="material-symbols:chat-outline" className="w-4 h-4" />
              Message
            </button>
          </div>
        )}
      </div>

      {/* Bio + Stats */}
      <div className="flex flex-col max-md:items-center max-md:justify-center max-md:px-5 w-full md:w-[630px]">
        <div className="text-left mb-8 px-2">
          <p className="text-slate-700 text-[18px] font-semibold leading-relaxed">
            {user?.bio || 'welcome to' + ' ' + user?.name + "'s profile!"}
          </p>
        </div>

        <div className="flex flex-row lg:justify-start justify-evenly p-2 gap-[2vw] md:gap-6">
          <div className="text-center w-[30vw] md:w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px]">
            <div className="text-2xl font-bold text-forest">{postsCount}</div>
            <div className="text-forest font-medium">Posts</div>
          </div>
          <div className="text-center w-[30vw] md:w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px]">
            <div className="text-2xl font-bold text-forest">{followersCount}</div>
            <div className="text-forest font-medium">Followers</div>
          </div>
          <div className="text-center w-[30vw] md:w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px]">
            <div className="text-2xl font-bold text-forest">{user?.following?.length || 0}</div>
            <div className="text-forest font-medium">Following</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    );
};

export default ProfileHeader;