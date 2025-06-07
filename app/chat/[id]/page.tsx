// app/chat/[id]/page.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react'; // Ensure you have @iconify/react installed

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
    messages: string[]; // This will be populated with Message objects later
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

    // Fetch chat details and messages on component mount or chatId change
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

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchChatDetails = async () => {
        setLoadingChat(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login'); // Redirect to login if no token
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
                router.push('/login'); // Redirect to login if no token
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

    // Determine the name and profile pic of the other person in the chat
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

    // Function to handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessageContent.trim() || !chatId) {
            alert("Message content cannot be empty.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to send messages.");
            router.push('/login');
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
                setMessages(prevMessages => [...prevMessages, sentMessage]); // Add the new message to state
                setNewMessageContent(''); // Clear the input field
                setError(null); // Clear any previous errors
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
     

    // Function to handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const { name: chatPartnerName, profilePic: chatPartnerProfilePic } = getOtherChatMember();

    // A more robust way to get logged-in user's ID for styling messages
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
                <Icon icon="line-md:loading-loop" className="w-12 h-12 text-forest" />
                <p className="ml-2">Loading chat...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center bg-ambient text-red-500 mb-5">
                <div className='pt-2'>
                    <Icon icon="material-symbols:error-outline" className="w-12 h-12 mb-4 mx-auto" />
                    <p className="text-[15px] font-semibold mb-2">Error Loading Chat</p>
                    <p>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-forest text-white rounded-lg hover:bg-pine"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-ambient text-forest h-screen">
                <p>Chat not found.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-forest text-white rounded-lg hover:bg-pine"
                >
                    Go Back
                </button>
            </div>
        );
    }
    console.log(chatPartnerProfilePic);
    return (
        // The main container for the chat section now takes full viewport height
        <div className="h-full flex flex-col px-4 pb-5 bg-ambient border-l border-gray-200 relative"> {/* Added h-screen */}

            {/* Chat Header (Jane Dallas / Michael San Francisco) */}
            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200 flex-shrink-0"> {/* Added flex-shrink-0 */}
                {chatPartnerProfilePic != "" ? (
    <img
        src={chatPartnerProfilePic}
        alt="Chat Partner Avatar"
        className="w-16 h-16 rounded-full object-cover"
    />
) : (
    <Icon icon="mdi:account-circle" className="w-16 h-16 text-gray-400" />
)}
                <h2 className="text-[18px] font-semibold text-slate-800 leading-none">
                    {chatPartnerName}
                </h2>
            </div>
           
            {/* Message Area - This is the scrollable part */}
            <div className="min-h-[80%] bg-ambient px-4 pb-10 rounded-lg  overflow-y-auto space-y-1 hideScrollbar"> {/* flex-1 ensures it fills remaining space */}
                {messages.length === 0 ? (
                    <p className="text-center text-slate flex-grow flex items-center justify-center">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map(msg => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.sender._id === loggedInUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`py-2 px-4 rounded-xl max-w-[70%] shadow
                                ${msg.sender._id === loggedInUserId ? 'bg-forest text-white' : 'bg-white text-black'}`
                            }>
                                {msg.sender._id !== loggedInUserId && (
                                    <div className="font-semibold text-[10px] mb-1">
                                        {msg.sender.name}
                                    </div>
                                )}
                                <p className="break-words text-[16px] font-normal leading-tight">{msg.content}</p>
                                <div className={`text-xs mt-1 text-right
                                    ${msg.sender._id === loggedInUserId ? 'text-gray-100' : 'text-slate/40'}`
                                }>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {/* {msg.sender._id === loggedInUserId && (
                                    <div className="text-xs mt-1 text-right text-forest">
                                        Seen just now
                                    </div>
                                )} */}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="mt-4 flex px-5 items-center absolute bottom-3 w-[97%] bg-white rounded-[20px] shadow-md p-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <input
                    type="text"
                    placeholder="Write a Message"
                    className="flex-1 border-none bg-transparent p-3 text-black text-[15px] font-medium focus:outline-none"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                {/* Paperclip icon */}
                <button className="p-2 text-forest hover:bg-gray-100 rounded-full">
                    <Icon icon="heroicons:paper-clip" className="h-8 w-8" />
                </button>
                {/* Send button */}
                <button
                    onClick={handleSendMessage}
                    className="bg-forest w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-pine ml-2"
                >
                    <Icon icon="mingcute:send-fill" className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;