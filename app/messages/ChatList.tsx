// app/chat/ChatList.tsx - Responsive Chat List
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

interface UserPopulated {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
}

interface MessagePopulated {
    _id: string;
    sender: UserPopulated;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface Chat {
    _id: string;
    members: UserPopulated[];
    lastMessage?: MessagePopulated;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
}

const ChatList: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        console.log("[ChatList useEffect 0] Component is mounted on client.");
    }, []);

    useEffect(() => {
        console.log(`[ChatList useEffect 1 (localStorage)] isClient: ${isClient}. Attempting localStorage read.`);
        if (!isClient) {
            console.log("[ChatList useEffect 1 (localStorage)] Not client-side yet, skipping localStorage read.");
            return;
        }

        const userString = localStorage.getItem('user');
        console.log("[ChatList useEffect 1 (localStorage)] localStorage 'user' string:", userString);

        if (userString) {
            try {
                const userObj = JSON.parse(userString);
                console.log("[ChatList useEffect 1 (localStorage)] Parsed user object:", userObj);
                setLoggedInUserId(userObj._id);
                console.log("[ChatList useEffect 1 (localStorage)] setLoggedInUserId to:", userObj._id);
            } catch (e) {
                console.error("[ChatList useEffect 1 (localStorage)] Error parsing user from localStorage:", e);
                setLoggedInUserId(null);
                setError("Failed to retrieve user session. Please log in again.");
                setLoading(false);
            }
        } else {
            console.log("[ChatList useEffect 1 (localStorage)] No 'user' found in localStorage. Redirecting to /auth.");
            setLoggedInUserId(null);
            setError("No user session found. Please log in.");
            setLoading(false);
            router.push('/auth');
        }
    }, [isClient, router]);

    useEffect(() => {
        console.log(`[ChatList useEffect 2 (Fetch)] loggedInUserId state: ${loggedInUserId}, isClient: ${isClient}`);

        if (loggedInUserId && isClient) {
            console.log("[ChatList useEffect 2 (Fetch)] loggedInUserId is set and client-side, attempting to fetch chats.");
            const fetchUserChats = async () => {
                setLoading(true);
                const token = localStorage.getItem('token');
                console.log("[ChatList fetchUserChats] localStorage 'token':", token ? "Found" : "Not Found");

                if (!token) {
                    console.error("[ChatList fetchUserChats] No authentication token found. Redirecting to /auth.");
                    setError("No authentication token found. Please log in.");
                    setLoading(false);
                    router.push('/auth');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/api/chat/user`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("[ChatList fetchUserChats] API Error:", errorData.msg || 'Failed to fetch chats.');
                        throw new Error(errorData.msg || 'Failed to fetch chats.');
                    }

                    const data = await response.json();
                    console.log("[ChatList fetchUserChats] Successfully fetched chat data:", data);
                    setChats(data);
                    setError(null);
                } catch (err) {
                    console.error('[ChatList fetchUserChats] Error fetching chats:', err);
                    setError(err instanceof Error ? err.message : 'Failed to fetch chats.');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserChats();
        } else if (loggedInUserId === null && isClient) {
             setLoading(false);
        }
    }, [loggedInUserId, isClient, API_BASE_URL, router]);

    const handleChatClick = (chatId: string) => {
        router.push(`/messages/${chatId}`);
    };

    const handleProfileClick = (userId: string) => {
        router.push(`/profile/${userId}`);
    };

    const getOtherMemberInfo = (chat: Chat) => {
        if (!loggedInUserId) {
            console.warn("[ChatList getOtherMemberInfo] called before loggedInUserId is set.");
            return { _id: '', name: "Loading User...", profilePic: undefined };
        }
        const otherMember = chat.members.find(member => member._id !== loggedInUserId);
        return otherMember || { _id: '', name: "Unknown User", profilePic: undefined };
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <Icon icon="line-md:loading-loop" className="w-6 h-6 sm:w-8 sm:h-8 text-forest" />
                <p className="ml-2 text-sm sm:text-base">Loading chats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center text-center p-4 text-red-500">
                <div>
                    <Icon icon="material-symbols:error-outline" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 mx-auto" />
                    <p className="text-xs sm:text-sm font-semibold mb-1">Error</p>
                    <p className="text-xs">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-3 py-1 bg-forest-light text-white rounded-md hover:bg-forest transition-colors text-xs sm:text-sm"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-ambient shadow-none z-10">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-ambient z-10">
                Your Chats
            </h2>
            {chats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-500">
                    <Icon icon="material-symbols:chat" className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-400" />
                    <p className="text-base sm:text-lg">No active chats yet.</p>
                    <p className="text-xs sm:text-sm mt-2">Start a conversation from a user's profile!</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => {
                        const otherMember = getOtherMemberInfo(chat);
                        const lastMessage = chat.lastMessage;
                        const isActive = pathname === `/chat/${chat._id}`;

                        return (
                            <div
                                key={chat._id}
                                className={`flex items-center p-3 sm:p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                                    isActive ? 'bg-teal-100' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleChatClick(chat._id)}
                            >
                                <div 
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 mr-3 sm:mr-4 bg-gray-200 flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent chat click from firing
                                        if (otherMember._id) handleProfileClick(otherMember._id);
                                    }}
                                >
                                    {otherMember.profilePic ? (
                                        <img src={otherMember.profilePic} alt={otherMember.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="material-symbols:person" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="font-semibold text-base sm:text-lg text-forest truncate">
                                        {chat.isGroup ? 'Group Chat (TODO)' : otherMember.name || "Loading..."}
                                    </div>
                                    {lastMessage && (
                                        <p className="text-gray-600 text-xs sm:text-sm truncate">
                                            <span className="font-medium text-gray-700">
                                                {lastMessage.sender?._id === loggedInUserId
                                                    ? 'You: '
                                                    : `${lastMessage.sender?.name?.split(' ')[0] || 'Someone'}: `}
                                            </span>
                                            {lastMessage.content}
                                        </p>
                                    )}
                                    {!lastMessage && (
                                        <p className="text-gray-500 text-xs sm:text-sm italic">No messages yet.</p>
                                    )}
                                </div>
                                {lastMessage && (
                                    <div className="text-xs text-gray-500 flex-shrink-0 ml-2 sm:ml-4 hidden sm:block">
                                        {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList;