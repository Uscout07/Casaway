// app/notifications/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import PostModal from '../components/postModal'; // Assuming this path is correct for your PostModal
import axios from 'axios'; // Used by PostModal internally, and for fetching post details for modal

interface User {
    _id: string;
    username: string;
    name?: string;
    profilePic?: string;
}

interface Comment {
    _id: string;
    user: User;
    content: string;
    parentCommentId?: string;
    createdAt: string;
    replies?: Comment[];
    isLikedByUser?: boolean;
    likesCount?: number;
}

interface Post {
    _id: string;
    user: User;
    image?: string;
    imageUrl?: string;
    caption?: string;
}

interface Notification {
    _id: string;
    recipient: string;
    type: 'like' | 'comment' | 'reply' | 'message' | 'chat';
    sourceUser: {
        _id: string;
        name: string;
        profilePic?: string;
    };
    relatedId: string; // The ID of the liked/commented/messaged entity (post, listing, comment, chat)
    targetType: 'post' | 'listing' | 'comment' | 'reply' | 'chat';
    isRead: boolean;
    createdAt: string;
    // These fields are populated by the backend for comments/replies for easier navigation
    parentEntityId?: string; // The ID of the parent post or listing if targetType is comment/reply
    parentEntityType?: 'post' | 'listing'; // Type of the parent entity
}

const NotificationPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            router.push('/auth');
        }
    }, [router]);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data: Notification[] = await response.json();
            setNotifications(data);
        } catch (err: any) {
            console.error('Failed to fetch notifications:', err);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [fetchNotifications, token]);

    const handleDeleteNotification = useCallback(async (id: string) => {
        try {
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(notif => notif._id !== id));
            } else {
                console.error('Failed to delete notification:', await response.text());
                setError('Failed to delete notification. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError('Error deleting notification. Please try again.');
        }
    }, [API_BASE_URL, token]);

    const handleNotificationClick = useCallback(async (notification: Notification) => {
        let path = '';
        let modalOpened = false;

        // Mark notification as read (optional, if you want to keep the isRead state)
        // You might need a separate API call here if you want to persist read status without deleting
        // For this request, we are deleting on click, so marking as read is implicitly handled.

        switch (notification.targetType) {
            case 'post':
                try {
                    const response = await fetch(`${API_BASE_URL}/api/posts/${notification.relatedId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (response.ok) {
                        const postData: Post = await response.json();
                        setSelectedPost(postData);
                        setShowPostModal(true);
                        modalOpened = true;
                    } else {
                        console.error('Failed to fetch post for modal:', await response.text());
                        setError('Failed to open post. It might have been deleted.');
                    }
                } catch (err) {
                    console.error('Error fetching post for modal:', err);
                    setError('Error opening post.');
                }
                break;
            case 'listing':
                path = `/listing/${notification.relatedId}`; // Corrected to singular 'listing'
                break;
            case 'chat':
                path = `/messages/${notification.relatedId}`; // Corrected to singular 'message'
                break;
            case 'comment':
            case 'reply':
                if (notification.parentEntityType === 'post' && notification.parentEntityId) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/posts/${notification.parentEntityId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        if (response.ok) {
                            const postData: Post = await response.json();
                            setSelectedPost(postData);
                            setShowPostModal(true);
                            modalOpened = true;
                        } else {
                            console.error('Failed to fetch parent post for comment/reply:', await response.text());
                            setError('Failed to open post with comment. It might have been deleted.');
                        }
                    } catch (err) {
                        console.error('Error fetching parent post for comment/reply:', err);
                        setError('Error opening post with comment.');
                    }
                } else if (notification.parentEntityType === 'listing' && notification.parentEntityId) {
                    path = `/listing/${notification.parentEntityId}`; // Corrected to singular 'listing'
                } else {
                    console.warn(`Could not determine parent for comment/reply notification: ${notification._id}`);
                    path = '/notifications'; // Fallback to notifications page
                }
                break;
            default:
                path = '/notifications'; // Default to notifications page
        }

        if (path) {
            router.push(path);
        }

        // Self-delete the notification after handling redirection/modal open
        if (path || modalOpened) {
            await handleDeleteNotification(notification._id);
        }
    }, [router, API_BASE_URL, token, handleDeleteNotification]);

    const getNotificationMessage = (notification: Notification) => {
        const { type, sourceUser, targetType } = notification;
        const userName = sourceUser?.name; // Removed 'Someone' fallback as per request

        switch (type) {
            case 'like':
                return `${userName} liked your ${targetType}.`;
            case 'comment':
                return `${userName} commented on your ${targetType}.`;
            case 'reply':
                return `${userName} replied to your comment.`;
            case 'message':
                return `${userName} sent you a message.`;
            case 'chat':
                return `${userName} started a chat with you.`;
            default:
                return 'New activity.';
        }
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'like': return 'material-symbols:favorite';
            case 'comment': return 'material-symbols:chat-bubble';
            case 'reply': return 'material-symbols:reply';
            case 'message': return 'material-symbols:mail';
            case 'chat': return 'material-symbols:chat';
            default: return 'material-symbols:notifications';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        return Math.floor(seconds) + ' seconds ago';
    };

    return (
        <div className="min-h-screen bg-ambient pt-[11vh] px-4 sm:px-6 lg:px-8 font-inter">
            <div className="max-w-3xl mx-auto py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Your Notifications</h1>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Icon icon="line-md:loading-loop" className="w-10 h-10 text-forest animate-spin" />
                        <p className="ml-3 text-lg text-gray-600">Loading notifications...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {!loading && notifications.length === 0 && !error && (
                    <div className="text-center py-12">
                        <Icon icon="material-symbols:notifications-off-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No new notifications</h3>
                        <p className="text-gray-600">You're all caught up!</p>
                    </div>
                )}

                {!loading && notifications.length > 0 && (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`flex items-center p-4 rounded-xl shadow-sm transition-all duration-200
                                    ${notification.isRead ? 'bg-white text-gray-600' : 'bg-teal-50 text-gray-900 border border-teal-200'}`}
                            >
                                <div
                                    className="flex items-center flex-grow cursor-pointer"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex-shrink-0 mr-4">
                                        {notification.sourceUser?.profilePic ? (
                                            <img
                                                src={notification.sourceUser.profilePic}
                                                alt={notification.sourceUser.name || 'User'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-forest"
                                                onError={(e) => {
                                                    e.currentTarget.src = `https://placehold.co/48x48/aabbcc/ffffff?text=${notification.sourceUser.name ? notification.sourceUser.name.charAt(0).toUpperCase() : 'U'}`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-forest-light flex items-center justify-center text-white text-xl font-bold">
                                                {notification.sourceUser?.name ? notification.sourceUser.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`text-base font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                            <Icon icon={getNotificationIcon(notification.type)} className="inline-block w-5 h-5 mr-2 text-forest" />
                                            {getNotificationMessage(notification)}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteNotification(notification._id)}
                                    className="ml-4 p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-500 transition-colors duration-200"
                                    aria-label="Delete notification"
                                >
                                    <Icon icon="mdi:close" className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showPostModal && selectedPost && token && (
                <PostModal
                    post={selectedPost}
                    modalOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    token={token}
                />
            )}
        </div>
    );
};

export default NotificationPage;
