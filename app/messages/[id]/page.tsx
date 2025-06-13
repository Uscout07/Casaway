// app/chat/[id]/page.tsx - Responsive Chat Page
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

interface UserPopulated {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
}

interface Chat {
    _id: string;
    members: UserPopulated[];
    isGroup: boolean;
    lastMessage?: string;
    messages: string[];
    createdAt: string;
    updatedAt: string;
}

interface Message {
    _id: string;
    sender: UserPopulated;
    chat: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

const ChatPage = () => {
    const params = useParams();
    const router = useRouter();
    const chatId = params.id as string;

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingChat, setLoadingChat] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessageContent, setNewMessageContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!chatId) {
            setError("Chat ID is missing.");
            setLoadingChat(false);
            setLoadingMessages(false);
            return;
        }
        fetchChatDetails();
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchChatDetails = async () => {
        setLoadingChat(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth');
                throw new Error('No authentication token found.');
            }

            const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to fetch chat details.');
            }
            const data = await response.json();
            setChat(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching chat details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch chat details');
        } finally {
            setLoadingChat(false);
        }
    };

    const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth');
                throw new Error('No authentication token found.');
            }

            const response = await fetch(`${API_BASE_URL}/api/message/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    const getOtherChatMember = () => {
        if (!chat || !chat.members) return { name: '...', profilePic: '/images/default-avatar.jpg' };

        const loggedInUserString = localStorage.getItem('user');
        let loggedInUserId: string | null = null;
        if(loggedInUserString) {
            try {
                const userObj = JSON.parse(loggedInUserString);
                loggedInUserId = userObj._id;
            } catch (e) {
                console.error("Failed to parse logged in user from localStorage", e);
            }
        }

        const otherMember = chat.members.find(member => member._id !== loggedInUserId);
        return otherMember ? { name: otherMember.name, profilePic: otherMember.profilePic || '/images/default-avatar.jpg' } : { name: 'Chat', profilePic: '/images/default-avatar.jpg' };
    };

    const handleSendMessage = async () => {
        if (!newMessageContent.trim() || !chatId) {
            alert("Message content cannot be empty.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to send messages.");
            router.push('/auth');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chatId: chatId,
                    content: newMessageContent.trim()
                })
            });

            if (response.ok) {
                const sentMessage = await response.json();
                setMessages(prevMessages => [...prevMessages, sentMessage]);
                setNewMessageContent('');
                setError(null);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to send message.');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
            alert(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const { name: chatPartnerName, profilePic: chatPartnerProfilePic } = getOtherChatMember();

    const loggedInUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let loggedInUserId: string | null = null;
    if (loggedInUserString) {
        try {
            loggedInUserId = JSON.parse(loggedInUserString)._id;
        } catch (e) {
            console.error("Failed to parse logged in user from localStorage", e);
        }
    }

    if (loadingChat || loadingMessages) {
        return (
            <div className="flex-1 flex items-center justify-center bg-ambient text-forest h-screen">
                <Icon icon="line-md:loading-loop" className="w-8 h-8 sm:w-12 sm:h-12 text-forest" />
                <p className="ml-2 text-sm sm:text-base">Loading chat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center bg-ambient text-red-500 p-4">
                <div className='pt-2'>
                    <Icon icon="material-symbols:error-outline" className="w-10 h-10 sm:w-12 sm:h-12 mb-4 mx-auto" />
                    <p className="text-sm sm:text-base font-semibold mb-2">Error Loading Chat</p>
                    <p className="text-xs sm:text-sm px-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-forest text-white rounded-lg hover:bg-pine text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-ambient text-forest h-screen p-4">
                <p className="text-sm sm:text-base mb-4">Chat not found.</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-forest text-white rounded-lg hover:bg-pine text-sm"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-ambient border-l border-gray-200 relative">
            {/* Mobile Back Button - Only show when coming from chat list */}
            <div className="lg:hidden flex items-center p-2 border-b border-gray-200 bg-ambient">
                <button
                    onClick={() => router.push('/chat')} // Go back to chat list on mobile
                    className="p-2 text-forest hover:bg-gray-100 rounded-full mr-2"
                >
                    <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-600">Back to Chats</span>
            </div>

            {/* Chat Header - Responsive */}
            <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b border-gray-200 flex-shrink-0 bg-ambient">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden flex-shrink-0">
                    {chatPartnerProfilePic && chatPartnerProfilePic !== "" ? (
                        <img
                            src={chatPartnerProfilePic}
                            alt="Chat Partner Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Icon icon="mdi:account-circle" className="w-full h-full text-gray-400" />
                    )}
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 truncate">
                    {chatPartnerName}
                </h2>
            </div>

            {/* Message Area - Responsive */}
            <div className="flex-1 bg-ambient px-2 sm:px-4 py-2 sm:py-4 overflow-y-auto space-y-2 sm:space-y-3 pb-20 sm:pb-24">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-center text-slate-500 text-sm sm:text-base px-4">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.sender._id === loggedInUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] shadow-sm
                                ${msg.sender._id === loggedInUserId ? 'bg-forest text-white' : 'bg-white text-black border'}`
                            }>
                                {msg.sender._id !== loggedInUserId && (
                                    <div className="font-semibold text-xs mb-1 text-gray-600">
                                        {msg.sender.name}
                                    </div>
                                )}
                                <p className="break-words text-sm sm:text-base font-normal leading-tight">
                                    {msg.content}
                                </p>
                                <div className={`text-xs mt-1 text-right
                                    ${msg.sender._id === loggedInUserId ? 'text-gray-200' : 'text-gray-500'}`
                                }>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area - Responsive */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 right-2 sm:left-4 sm:right-4 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center p-2 sm:p-3 flex-shrink-0">
                <input
                    type="text"
                    placeholder="Write a Message"
                    className="flex-1 border-none bg-transparent px-2 sm:px-3 py-2 text-black text-sm sm:text-base font-medium focus:outline-none"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                
                {/* Attachment button - Hidden on very small screens */}
                <button className="hidden sm:block p-2 text-forest hover:bg-gray-100 rounded-full transition-colors">
                    <Icon icon="heroicons:paper-clip" className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                
                {/* Send button - Responsive size */}
                <button
                    onClick={handleSendMessage}
                    className="bg-forest w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white hover:bg-pine ml-2 transition-colors flex-shrink-0"
                    disabled={!newMessageContent.trim()}
                >
                    <Icon icon="mingcute:send-fill" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;