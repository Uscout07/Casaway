// app/chat/ChatList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

// Interfaces (remain the same)
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
    const [loading, setLoading] = useState(true); // Keep initial loading true
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Effect 1 (runs once): Set isClient to true once component mounts on client
    useEffect(() => {
        setIsClient(true);
        console.log("[ChatList useEffect 0] Component is mounted on client.");
    }, []);

    // Effect 2: Load loggedInUserId from localStorage, only if isClient is true
    // This effect should be responsible for setting loggedInUserId and *only* then.
    // It should *not* set loading to false directly if it intends for the next effect to fetch.
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
                // DO NOT set loading to false here. Let Effect 3 handle the loading for fetch.
            } catch (e) {
                console.error("[ChatList useEffect 1 (localStorage)] Error parsing user from localStorage:", e);
                setLoggedInUserId(null);
                setError("Failed to retrieve user session. Please log in again.");
                setLoading(false); // Set loading false if user parsing failed (no subsequent fetch)
            }
        } else {
            console.log("[ChatList useEffect 1 (localStorage)] No 'user' found in localStorage. Redirecting to /auth.");
            setLoggedInUserId(null);
            setError("No user session found. Please log in.");
            setLoading(false); // Set loading false as there's no user and no fetch will occur
            router.push('/auth');
        }
    }, [isClient, router]);

    // Effect 3: Fetch chats when loggedInUserId is available and client-side
    useEffect(() => {
        console.log(`[ChatList useEffect 2 (Fetch)] loggedInUserId state: ${loggedInUserId}, isClient: ${isClient}`);

        // Only fetch if loggedInUserId is set AND the component is on the client side
        // and we are not already loading (to prevent re-triggering on loading state change itself)
        if (loggedInUserId && isClient) {
            // We only trigger fetch if loggedInUserId is truly ready.
            // set loading to true *here* and only if not already loading, to prevent
            // a loop from loading state change.
            // A more robust pattern might be to ensure `loggedInUserId` changes from null to a value.
            console.log("[ChatList useEffect 2 (Fetch)] loggedInUserId is set and client-side, attempting to fetch chats.");
            const fetchUserChats = async () => {
                setLoading(true); // Start loading when fetch begins
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
                    setLoading(false); // Stop loading when fetch ends
                }
            };

            fetchUserChats();
        } else if (loggedInUserId === null && isClient) {
            // If client-side and loggedInUserId is null, it means there's no user,
            // and the previous effect should have handled redirecting/error.
            // So we just ensure loading is false.
             setLoading(false);
        }
        // Removed the `loading` dependency from here.
    }, [loggedInUserId, isClient, API_BASE_URL, router]);


    const handleChatClick = (chatId: string) => {
        router.push(`/chat/${chatId}`);
    };

    const getOtherMemberInfo = (chat: Chat) => {
        if (!loggedInUserId) {
            console.warn("[ChatList getOtherMemberInfo] called before loggedInUserId is set.");
            return { name: "Loading User...", profilePic: undefined };
        }
        const otherMember = chat.members.find(member => member._id !== loggedInUserId);
        return otherMember || { name: "Unknown User", profilePic: undefined };
    };

    // Conditional rendering based on loading and error states
    if (loading) {
        // This covers both initial server-side render/hydration AND client-side data fetching
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <Icon icon="line-md:loading-loop" className="w-8 h-8 text-forest" />
                <p className="ml-2">Loading chats...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center text-center p-4 text-red-500">
                <div>
                    <Icon icon="material-symbols:error-outline" className="w-10 h-10 mb-2 mx-auto" />
                    <p className="text-sm font-semibold mb-1">Error</p>
                    <p className="text-xs">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-3 py-1 bg-forest-light text-white rounded-md hover:bg-forest transition-colors text-sm"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    // At this point, loading is false, and there's no error.
    // Display the chat list or "no chats" message.
    return (
        <div className="flex flex-col h-full overflow-y-auto bg-ambient shadow-none">
            <h2 className="text-2xl font-bold p-4 border-b border-gray-200 sticky top-0 bg-ambient z-10">Your Chats</h2>
            {chats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-500">
                    <Icon icon="material-symbols:chat" className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-lg">No active chats yet.</p>
                    <p className="text-sm mt-2">Start a conversation from a user's profile!</p>
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
                                className={`flex items-center p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                                    isActive ? 'bg-teal-100' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleChatClick(chat._id)}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-4 bg-gray-200 flex items-center justify-center">
                                    {otherMember.profilePic ? (
                                        <img src={otherMember.profilePic} alt={otherMember.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="material-symbols:person" className="w-8 h-8 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="font-semibold text-lg text-forest truncate">
                                        {chat.isGroup ? 'Group Chat (TODO)' : otherMember.name || "Loading..."}
                                    </div>
                                    {lastMessage && (
                                        <p className="text-gray-600 text-sm truncate">
                                            <span className="font-medium text-gray-700">
                                                {lastMessage.sender?._id === loggedInUserId
                                                    ? 'You: '
                                                    : `${lastMessage.sender?.name?.split(' ')[0] || 'Someone'}: `}
                                            </span>
                                            {lastMessage.content}
                                        </p>
                                    )}
                                    {!lastMessage && (
                                        <p className="text-gray-500 text-sm italic">No messages yet.</p>
                                    )}
                                </div>
                                {lastMessage && (
                                    <div className="text-xs text-gray-500 flex-shrink-0 ml-4">
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