// app/chat/ChatList.tsx - Responsive Chat List
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { chatApi } from '../services/chatApi';

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
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [users, setUsers] = useState<UserPopulated[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [creating, setCreating] = useState(false);
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

    // Load users for selection when opening group modal
    useEffect(() => {
        const fetchUsers = async () => {
            if (!showGroupModal) return;
            try {
                const all = await chatApi.getAllUsers();
                setUsers(all);
            } catch (e) {
                console.error('Failed to load users', e);
            }
        };
        fetchUsers();
    }, [showGroupModal]);

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
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-ambient z-10">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Your Chats</h2>
                <button
                    onClick={() => setShowGroupModal(true)}
                    className="px-3 py-2 rounded-md bg-forest text-white flex items-center gap-2"
                >
                    <Icon icon="mdi:account-multiple-plus" className="text-lg" />
                    New Group
                </button>
            </div>
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
                                    {chat.isGroup ? (
                                        <Icon icon="mdi:account-group" className="w-6 h-6 sm:w-8 sm:h-8 text-forest" />
                                    ) : otherMember.profilePic ? (
                                        <img src={otherMember.profilePic} alt={otherMember.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon icon="material-symbols:person" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="font-semibold text-base sm:text-lg text-forest truncate">
                                        {chat.isGroup ? (chat as any).groupName || 'Group' : otherMember.name || "Loading..."}
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
            {showGroupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Group Chat</h3>
                        <label className="text-sm text-gray-700">Group Name</label>
                        <input
                            className="mt-1 w-full border rounded-md px-3 py-2 mb-4"
                            placeholder="My Group"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <label className="text-sm text-gray-700">Group Description (optional)</label>
                        <textarea
                            className="mt-1 w-full border rounded-md px-3 py-2 mb-4 min-h-[72px]"
                            placeholder="What is this group about?"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                        />
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-700">Selected Members ({selectedUserIds.length})</label>
                            <button
                                onClick={async () => {
                                    try {
                                        setShowUserSelector(true);
                                        if (users.length === 0) {
                                            const all = await chatApi.getAllUsers();
                                            setUsers(all);
                                        }
                                        setUserSearch('');
                                    } catch {}
                                }}
                                className="px-3 py-1 rounded-md bg-forest text-white text-xs"
                            >
                                Add Members
                            </button>
                        </div>
                        {selectedUserIds.length === 0 ? (
                            <div className="text-xs text-gray-500 mb-2">No members selected yet.</div>
                        ) : (
                            <div className="space-y-2 mb-2">
                                {users.filter(u => selectedUserIds.includes(u._id)).map(u => (
                                    <div key={u._id} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                                        <div className="flex items-center min-w-0">
                                            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                                                {u.profilePic ? (
                                                    <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="material-symbols:person" className="w-5 h-5 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-black truncate">{u.name}</div>
                                                <div className="text-xs text-gray-600 truncate">{u.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedUserIds(prev => prev.filter(id => id !== u._id))}
                                            className="ml-2 text-red-500 hover:text-red-600"
                                        >
                                            <Icon icon="material-symbols:close" className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800">Cancel</button>
                            <button
                                disabled={creating || !groupName.trim() || selectedUserIds.length < 2}
                                onClick={async () => {
                                    const ids = selectedUserIds;
                                    if (!groupName.trim() || ids.length < 2) {
                                        setError('Provide a group name and select at least 2 members.');
                                        return;
                                    }
                                    try {
                                        setCreating(true);
                                        await chatApi.createGroupChat(groupName.trim(), ids, groupDescription.trim() || undefined);
                                        setShowGroupModal(false);
                                        setGroupName('');
                                        setGroupDescription('');
                                        setSelectedUserIds([]);
                                        // refresh list
                                        const token = localStorage.getItem('token');
                                        if (token) {
                                            const res = await fetch(`${API_BASE_URL}/api/chat/user`, { headers: { Authorization: `Bearer ${token}` } });
                                            if (res.ok) setChats(await res.json());
                                        }
                                    } catch (e: any) {
                                        setError(e?.message || 'Failed to create group');
                                    } finally {
                                        setCreating(false);
                                    }
                                }}
                                className={`px-4 py-2 rounded-md text-white ${creating || !groupName.trim() || selectedUserIds.length < 2 ? 'bg-forest/50 cursor-not-allowed' : 'bg-forest hover:bg-pine'}`}
                            >
                                {creating ? 'Creating...' : 'Create Group Chat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Selector Sheet */}
            {showGroupModal && showUserSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[1200]">
                    <div className="bg-white w-full max-w-2xl rounded-t-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <button onClick={() => setShowUserSelector(false)} className="text-forest">Cancel</button>
                            <div className="font-semibold text-forest">Select Members</div>
                            <button onClick={() => setShowUserSelector(false)} className="text-forest">Done</button>
                        </div>
                        <div className="p-4 border-b border-gray-200">
                            <input
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {users
                                .filter(u => (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase()))
                                .map(u => {
                                    const isSelected = selectedUserIds.includes(u._id);
                                    return (
                                        <button
                                            type="button"
                                            key={u._id}
                                            onClick={() => setSelectedUserIds(prev => isSelected ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                                            className="w-full flex items-center p-3 border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                                                {u.profilePic ? (
                                                    <img src={u.profilePic} alt={u.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon icon="material-symbols:person" className="w-6 h-6 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="text-sm font-medium text-black truncate">{u.name}</div>
                                                <div className="text-xs text-gray-600 truncate">{u.email}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-forest border-forest' : 'border-gray-300'}`}>
                                                {isSelected && <span className="block w-2.5 h-2.5 bg-white rounded-sm" />}
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;