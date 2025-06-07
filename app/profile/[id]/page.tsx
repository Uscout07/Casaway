'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, } from 'next/navigation';
import { Icon } from '@iconify/react';
import ListingCard from '../../components/listingCard';
import PostModal from '../../components/postModal';

interface User {
    _id: string;
    name: string;
    username: string;
    city: string;
    country: string;
    bio: string;
    profilePic?: string;
    phone?: string;
    role: 'user' | 'admin';
    followers: string[];
    following: string[];
    instagramUrl?: string;
    createdAt: string;
    updatedAt: string;
}

interface Listing {
    _id: string;
    title: string;
    details: string;
    type: 'Single Room' | 'Whole Apartment' | 'Whole House';
    amenities: string[];
    city: string;
    country: string;
    roommates: string;
    tags: string[];
    availability: {
        startDate: string;
        endDate: string;
    }[];
    images: string[];
    thumbnail: string;
    user: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Post {
    _id: string;
    user: {
        _id: string;
        name: string;
        username: string;
        profilePic?: string;
    };
    caption: string;
    tags: string[];
    city: string;
    country: string;
    imageUrl: string;
    images: string[];
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

const ProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [userLoading, setUserLoading] = useState(true);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);
    const [listingsError, setListingsError] = useState<string | null>(null);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No authentication token found. Cannot determine logged-in user.");
            setLoggedInUserId(null);
        } else {
            fetchLoggedInUser(token);
        }

        if (userId) {
            fetchUser();
            fetchUserListings();
            fetchUserPosts();
        }
    }, [userId]);

    useEffect(() => {
        if (user && loggedInUserId) {
            setIsMyProfile(user._id === loggedInUserId);
            setFollowersCount(user.followers?.length || 0);

            if (user._id !== loggedInUserId) {
                checkFollowStatus();
            }
        } else {
            setIsMyProfile(false);
        }
    }, [user, loggedInUserId]);

    const fetchLoggedInUser = async (token: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setLoggedInUserId(data._id);
            } else {
                console.error("Failed to fetch logged-in user. Status:", response.status);
                localStorage.removeItem('token');
                router.push('/login');
            }
        } catch (error) {
            console.error("Error fetching logged-in user:", error);
            localStorage.removeItem('token');
            router.push('/login');
        }
    };

    const fetchUser = async () => {
        try {
            setUserLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }});
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            setUser(data);
            setUserError(null);
        } catch (err) {
            console.error('Error fetching user:', err);
            setUserError(err instanceof Error ? err.message : 'Failed to fetch user');
        } finally {
            setUserLoading(false);
        }
    };

    const fetchUserListings = async () => {
        try {
            setListingsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/listing/user/${userId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            setListings(data);
            setListingsError(null);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setListingsError(err instanceof Error ? err.message : 'Failed to fetch listings');
        } finally {
            setListingsLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            setPostsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            setPosts(data);
            setPostsError(null);
        } catch (err) {
            console.error('Error fetching user posts:', err);
            setPostsError(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setPostsLoading(false);
        }
    };

    const checkFollowStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token || !userId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/follow/status/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollowToggle = async () => {
        if (!loggedInUserId || !user?._id) {
            console.error("Cannot follow: Logged-in user or target user ID is missing.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to follow users.");
            router.push('/login');
            return;
        }

        setFollowLoading(true);

        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await fetch(`${API_BASE_URL}/api/follow/${endpoint}/${user._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);

                if (user) {
                    setUser({
                        ...user,
                        followers: new Array(data.followersCount).fill('')
                    });
                }
                router.refresh();
            } else {
                const errorData = await response.json();
                console.error(`Failed to ${endpoint}:`, errorData.msg);
                alert(errorData.msg || `Failed to ${endpoint} user.`);
            }
        } catch (error) {
            console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleStartChat = async () => {
        if (!loggedInUserId || !user?._id) {
            console.error("Cannot start chat: Logged-in user ID or target user ID is missing.");
            alert("Error: Cannot start chat. Missing user information.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to start a chat.");
            router.push('/login');
            return;
        }

        try {
            console.log(`Attempting to create/get chat with targetUserId: ${user._id}`);
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId: user._id })
            });

            if (response.ok) {
                const chat = await response.json();
                console.log('Chat created or found:', chat);
                router.push(`/chat/${chat._id}`);
            } else {
                const errorData = await response.json();
                console.error("Failed to create/get chat:", errorData.msg || "Unknown error");
                alert(`Failed to start chat: ${errorData.msg || "Please try again."}`);
            }
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("An unexpected error occurred while trying to start a chat.");
        }
    };

    const ProfileHeader = () => (
        <div className="text-center my-5 bg-ambient">
            <div className="mx-auto">
                <div className="w-screen flex flex-col lg:flex-row items-center justify-evenly">
                    <div className="flex flex-col items-center w-[30%] leading-tight">
                        <div className="w-48 h-48 flex items-center justify-center rounded-full overflow-hidden mb-6 border-4 border-forest ">
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
                            <Link href="../settings"
                             className="mt-6 flex items-center justify-center w-[300px] h-[45px] bg-forest text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
                                Edit Profile
                            </Link>
                        ) : (
                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`w-[145px] h-[45px] rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${isFollowing
                                            ? 'bg-gray-500 text-white hover:bg-gray-600'
                                            : 'bg-forest text-white hover:bg-teal-800'
                                        } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {followLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Icon
                                                icon={isFollowing ? "material-symbols:person-remove" : "material-symbols:person-add"}
                                                className="w-4 h-4"
                                            />
                                            {isFollowing ? 'Unfollow' : 'Follow'}
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleStartChat}
                                    className="w-[145px] h-[45px] bg-forest text-white rounded-full font-medium hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Icon icon="material-symbols:chat-outline" className="w-4 h-4" />
                                    Message
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col w-[630px]">
                        <div className="text-left mb-8">
                            <p className="text-slate-700 pr-2 text-[18px] font-semibold leading-relaxed">
                                {user?.bio || 'welcome to' + ' ' + user?.name + "'s profile!"}
                            </p>
                        </div>

                        <div className="flex justify-center lg:justify-start gap-6">
                            <div className="text-center w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px] min-w-[120px]">
                                <div className="text-2xl font-bold text-forest">{listings.length}</div>
                                <div className="text-forest font-medium">Listings</div>
                            </div>
                            <div className="text-center w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px] min-w-[120px]">
                                <div className="text-2xl font-bold text-forest">{followersCount}</div>
                                <div className="text-forest font-medium">Followers</div>
                            </div>
                            <div className="text-center w-[150px] h-[100px] flex flex-col items-center justify-center border-2 border-forest rounded-[20px] min-w-[120px]">
                                <div className="text-2xl font-bold text-forest">{user?.following?.length || 0}</div>
                                <div className="text-forest font-medium">Following</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ListingsSection = () => (
        <div className="px-20 mx-auto pt-10">
            <h2 className="text-[18px] font-bold font-inter text-forest mb-6">Listings</h2>
            {listingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse h-[300px] flex flex-col">
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
            ) : listingsError ? (
                <div className="text-center py-8">
                    <Icon icon="material-symbols:error-outline" className="w-8 h-8 mb-2 mx-auto text-red-500" />
                    <p className="text-red-600">{listingsError}</p>
                </div>
            ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                    {listings.map(listing => (
                        <ListingCard key={listing._id} listing={listing} />
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

    const PostsSection = () => (
        <div className="px-20 mx-auto py-10">
            <h2 className="text-[18px] font-bold font-inter text-forest mb-6">Posts</h2>
            {postsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
                    ))}
                </div>
            ) : postsError ? (
                <div className="text-center py-8">
                    <Icon icon="material-symbols:error-outline" className="w-8 h-8 mb-2 mx-auto text-red-500" />
                    <p className="text-red-600">{postsError}</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-10">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="aspect-square w-[340px] overflow-hidden cursor-pointer"
                            onClick={() => {
                                setSelectedPost(post);
                                setModalOpen(true);
                            }}
                        >
                            <img
                                src={post.imageUrl}
                                alt={post.caption}
                                className="object-cover w-full h-full hover:opacity-90 transition-opacity"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Icon icon="material-symbols:article-outline" className="w-12 h-12 mb-4 mx-auto text-gray-400" />
                    <p className="text-forest">No posts found</p>
                </div>
            )}
        </div>
    );

    if (userLoading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F8EFE0' }}>
                <div className="animate-pulse">
                    <div className="text-center mb-12">
                        <div className="h-12 bg-gray-200 rounded mx-auto w-32 mb-12"></div>
                        <div className="max-w-4xl mx-auto flex items-center gap-12">
                            <div className="flex flex-col items-center">
                                <div className="w-48 h-48 bg-gray-200 rounded-full mb-6"></div>
                                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                                <div className="h-4 bg-gray-200 rounded mb-8 w-3/4"></div>
                                <div className="flex gap-6">
                                    <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                                    <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                                    <div className="h-20 bg-gray-200 rounded-2xl w-24"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (userError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center bg-ambient">
                <div className="text-red-600">
                    <Icon icon="material-symbols:error-outline" className="w-12 h-12 mb-4 mx-auto" />
                    <p className="text-lg font-semibold mb-2">Error Loading Profile</p>
                    <p>{userError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter">
            {user && <ProfileHeader />}
            <ListingsSection />
            <PostsSection />
            
            {selectedPost && modalOpen && (
                <PostModal
                    post={selectedPost}
                    modalOpen={modalOpen}
                    onClose={() => {
                        setSelectedPost(null);
                        setModalOpen(false);
                    }}
                    token={typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}
                />
            )}
        </div>
    );
};

export default ProfilePage;