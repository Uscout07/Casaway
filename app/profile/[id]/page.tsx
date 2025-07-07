// app/profile/[id]/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Import new components
import ProfileHeader from '../profilePageHeader' // Adjust the import path as necessary
import ListingsSection from '../listingsSection';
import PostsSection from '../postSection';
import ProfileLoadingSkeleton from '../profileLoadingSkeleton';
import ProfileErrorDisplay from '../profileErrorDisplay';

// Import existing components
import PostModal from '../../components/postModal';

// Import interfaces from the shared types file
import { User, Post } from '../profileTypes'; // Adjust path as necessary
import { Listing } from '../../types'; // Import Listing from the same location as ListingsSection

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

    const fetchLoggedInUser = useCallback(async (token: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
    }, [API_BASE_URL, router]);

    const fetchUser = useCallback(async () => {
        try {
            setUserLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
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
    }, [API_BASE_URL, userId]);

    const fetchUserListings = useCallback(async () => {
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
    }, [API_BASE_URL, userId]);

    const fetchUserPosts = useCallback(async () => {
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
    }, [API_BASE_URL, userId]);

    const checkFollowStatus = useCallback(async () => {
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
    }, [API_BASE_URL, userId]);


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
    }, [userId, fetchLoggedInUser, fetchUser, fetchUserListings, fetchUserPosts]);

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
    }, [user, loggedInUserId, checkFollowStatus]);

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

                // Update user state to reflect new followers count for immediate UI update
                setUser(prevUser => prevUser ? {
                    ...prevUser,
                    followers: data.isFollowing ? [...(prevUser.followers || []), loggedInUserId] : prevUser.followers?.filter(id => id !== loggedInUserId)
                } : prevUser);

                //router.refresh(); // This might cause full page reload, consider more granular state updates
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
                router.push(`/messages/${chat._id}`);
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

    const handlePostClick = (post: Post) => {
        setSelectedPost(post);
        setModalOpen(true);
    };

    if (userLoading) {
        return <ProfileLoadingSkeleton />;
    }

    if (userError) {
        return <ProfileErrorDisplay errorMessage={userError} onRetry={() => window.location.reload()} />;
    }

    return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter w-screen">
            {user && (
                <ProfileHeader
                    user={user}
                    isMyProfile={isMyProfile}
                    isFollowing={isFollowing}
                    followLoading={followLoading}
                    followersCount={followersCount}
                    postsCount={posts.length} 
                    onFollowToggle={handleFollowToggle}
                    onStartChat={handleStartChat}
                />
            )}
            <ListingsSection
                listings={listings}
                listingsLoading={listingsLoading}
                listingsError={listingsError}
            />
            <PostsSection
                posts={posts}
                postsLoading={postsLoading}
                postsError={postsError}
                onPostClick={handlePostClick}
            />

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