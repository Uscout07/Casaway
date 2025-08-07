'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
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

// Custom Error Modal Component
const ErrorModal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <Icon icon="material-symbols:error-outline" className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-700">Error!</h3>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Custom Prompt Modal Component
const PromptModal: React.FC<{
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}> = ({ message, defaultValue, onConfirm, onCancel }) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    const handleConfirm = () => {
        onConfirm(inputValue);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{message}</h3>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-forest text-white rounded-md hover:bg-pine transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


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
    const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State for custom modals
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const [promptInput, setPromptInput] = useState('');
    const [onPromptConfirm, setOnPromptConfirm] = useState<((value: string) => void) | null>(null);


    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Function to show custom error modal
    const displayErrorModal = useCallback((message: string) => {
        setModalMessage(message);
        setShowErrorModal(true);
    }, []);

    // Effect to fetch chat details and messages
    useEffect(() => {
        if (!chatId) {
            displayErrorModal("Chat ID is missing.");
            setLoadingChat(false);
            setLoadingMessages(false);
            return;
        }
        fetchChatDetails();
        fetchMessages();
    }, [chatId, displayErrorModal]);

    // Effect to scroll to the bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Helper to check if message is within 24 hours for edit/delete for everyone
    const isWithin24Hours = (timestamp: string) =>
        Date.now() - new Date(timestamp).getTime() <= 24 * 60 * 60 * 1000;

    // Toggle message options menu
    const openMenuFor = (id: string) => {
        setSelectedMsgId(prev => (prev === id ? null : id));
    };

    // Fetch chat details from API
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
            displayErrorModal(err instanceof Error ? err.message : 'Failed to fetch chat details');
        } finally {
            setLoadingChat(false);
        }
    };

    // Fetch messages from API
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
            displayErrorModal(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    // Get the other chat member's details for display
    const getOtherChatMember = () => {
        if (!chat || !chat.members) return { _id: '', name: '...', profilePic: undefined };

        const loggedInUserString = localStorage.getItem('user');
        let loggedInUserId: string | null = null;
        if (loggedInUserString) {
            try {
                const userObj = JSON.parse(loggedInUserString);
                loggedInUserId = userObj._id;
            } catch (e) {
                console.error("Failed to parse logged in user from localStorage", e);
            }
        }

        const otherMember = chat.members.find(member => member._id !== loggedInUserId);
        return otherMember ? { _id: otherMember._id, name: otherMember.name, profilePic: otherMember.profilePic || undefined } : { _id: '', name: 'Chat', profilePic: undefined };
    };

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (!newMessageContent.trim() || !chatId) {
            displayErrorModal("Message content cannot be empty.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            displayErrorModal("Please log in to send messages.");
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
            displayErrorModal(err instanceof Error ? err.message : 'Failed to send message');
        }
    };

    // Handle deleting message for current user
    const handleDeleteForMe = async (messageId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/message/delete-for-me/${messageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to delete message for me.');
            }
            setSelectedMsgId(null);
            fetchMessages(); // Re-fetch messages to update UI
        } catch (err) {
            console.error('Error deleting message for me:', err);
            displayErrorModal(err instanceof Error ? err.message : 'Failed to delete message for me');
        }
    };

    // Handle deleting message for everyone in the chat
    const handleDeleteForEveryone = async (messageId: string) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/message/delete-for-everyone/${messageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to delete message for everyone.');
            }
            setSelectedMsgId(null);
            fetchMessages(); // Re-fetch messages to update UI
        } catch (err) {
            console.error('Error deleting message for everyone:', err);
            displayErrorModal(err instanceof Error ? err.message : 'Failed to delete message for everyone');
        }
    };

    // Handle editing an existing message
    const handleEditMessage = async (messageId: string, newContent: string) => {
        const token = localStorage.getItem('token');
        if (!newContent.trim()) {
            displayErrorModal("Edited message content cannot be empty.");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/message/edit/${messageId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to edit message.');
            }
            setSelectedMsgId(null);
            fetchMessages(); // Re-fetch messages to update UI
        } catch (err) {
            console.error('Error editing message:', err);
            displayErrorModal(err instanceof Error ? err.message : 'Failed to edit message');
        } finally {
            setShowPromptModal(false); // Close prompt modal after attempt
        }
    };

    // Handle Enter key press for sending messages
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    // Get logged in user ID
    const loggedInUserString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let loggedInUserId: string | null = null;
    if (loggedInUserString) {
        try {
            loggedInUserId = JSON.parse(loggedInUserString)._id;
        } catch (e) {
            console.error("Failed to parse logged in user from localStorage", e);
        }
    }

    // Prepare chat partner details
    const { _id: chatPartnerId, name: chatPartnerName, profilePic: chatPartnerProfilePic } = getOtherChatMember();

    // Handle clicking on the chat partner's profile picture/name
    const handleChatPartnerProfileClick = () => {
        if (chatPartnerId) {
            router.push(`/profile/${chatPartnerId}`);
        }
    };

    // Loading state UI
    if (loadingChat || loadingMessages) {
        return (
            <div className="flex-1 flex items-center justify-center bg-ambient text-forest h-screen">
                <Icon icon="line-md:loading-loop" className="w-8 h-8 sm:w-12 sm:h-12 text-forest" />
                <p className="ml-2 text-sm sm:text-base">Loading chat...</p>
            </div>
        );
    }

    // Error state UI
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center bg-ambient text-red-500 p-4 h-screen">
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

    return (
        <div className="h-full flex flex-col bg-ambient border-l border-gray-200 relative">
            {/* Custom Modals */}
            {showErrorModal && <ErrorModal message={modalMessage} onClose={() => setShowErrorModal(false)} />}
            {showPromptModal && onPromptConfirm && (
                <PromptModal
                    message={promptMessage}
                    defaultValue={promptInput}
                    onConfirm={(value) => {
                        onPromptConfirm(value);
                        setShowPromptModal(false);
                    }}
                    onCancel={() => setShowPromptModal(false)}
                />
            )}

            {/* Header for mobile view (back button) */}
            <div className="lg:hidden flex items-center p-2 border-b border-gray-200 bg-ambient">
                <button
                    onClick={() => router.push('/messages')}
                    className="p-2 text-forest hover:bg-gray-100 rounded-full mr-2"
                >
                    <Icon icon="heroicons:arrow-left" className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-600">Back to Chats</span>
            </div>

            {/* Chat Partner Header */}
            <div 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b border-gray-200 flex-shrink-0 bg-ambient cursor-pointer"
                onClick={handleChatPartnerProfileClick}
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    {chatPartnerProfilePic ? (
                        <img src={chatPartnerProfilePic} alt="Chat Partner" className="w-full h-full object-cover" />
                    ) : (
                        <Icon icon="material-symbols:person" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    )}
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 truncate">
                    {chatPartnerName}
                </h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-ambient px-2 sm:px-4 py-2 sm:py-4 overflow-y-auto space-y-2 sm:space-y-3 pb-20 sm:pb-24">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-center text-slate-500 text-sm sm:text-base px-4">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isSender = msg.sender._id === loggedInUserId;
                        const within24Hours = isWithin24Hours(msg.createdAt);

                        return (
                            <div
                                key={msg._id}
                                className={`group flex items-center ${isSender ? 'justify-end' : 'justify-start'} relative`}
                            >
                                {/* Three dots for sender (left side of their message) */}
                                {isSender && (
                                    <div className="relative mr-2 flex-shrink-0">
                                        <button
                                            onClick={() => openMenuFor(msg._id)}
                                            className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                        >
                                            <Icon icon="mdi:dots-vertical" className="h-5 w-5" />
                                        </button>
                                        {selectedMsgId === msg._id && (
                                            <div className="absolute top-0 right-full mr-2 bg-white border border-gray-200 rounded-md shadow-md z-[100] text-sm w-48 overflow-hidden">
                                                {isSender && within24Hours && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setPromptMessage("Edit message:");
                                                                setPromptInput(msg.content);
                                                                setOnPromptConfirm(() => (newContent: string) => handleEditMessage(msg._id, newContent));
                                                                setShowPromptModal(true);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteForEveryone(msg._id)}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                                        >
                                                            Delete for Everyone
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteForMe(msg._id)}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                >
                                                    Delete for Me
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] shadow-sm ${isSender ? 'bg-forest text-white' : 'bg-white text-black'}`}>
                                    {!isSender && (
                                        <div className="font-semibold text-xs mb-1 text-gray-600">
                                            <span 
                                                className="cursor-pointer hover:underline"
                                                onClick={() => handleChatPartnerProfileClick()}
                                            >
                                                {msg.sender.name}
                                            </span>
                                        </div>
                                    )}
                                    <p className="break-words text-sm sm:text-base font-normal leading-tight">
                                        {msg.content}
                                    </p>
                                    <div className={`text-xs mt-1 text-right ${isSender ? 'text-gray-200' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Three dots for receiver (right side of their message) */}
                                {!isSender && (
                                    <div className="relative ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => openMenuFor(msg._id)}
                                            className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                        >
                                            <Icon icon="mdi:dots-vertical" className="h-5 w-5" />
                                        </button>
                                        {selectedMsgId === msg._id && (
                                            <div className="absolute top-0 left-full ml-2 bg-white border border-gray-200 rounded-md shadow-md z-[100] text-sm w-48 overflow-hidden">
                                                {/* Receiver can only delete for themselves */}
                                                <button
                                                    onClick={() => handleDeleteForMe(msg._id)}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                >
                                                    Delete for Me
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className='w-full bg-gradient-to-b from-ambient/50 to-ambient backdrop-blur-sm absolute bottom-0 py-3'>
                <div className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center mx-4 p-2 sm:p-3">
                    <input
                        type="text"
                        placeholder="Write a Message"
                        className="flex-1 border-none bg-transparent px-2 sm:px-3 py-2 text-black text-sm sm:text-base font-medium focus:outline-none"
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="hidden sm:block p-2 text-forest hover:bg-gray-100 rounded-full transition-colors">
                        <Icon icon="heroicons:paper-clip" className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                        onClick={handleSendMessage}
                        className="bg-forest w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white hover:bg-pine ml-2 transition-colors flex-shrink-0"
                        disabled={!newMessageContent.trim()}
                    >
                        <Icon icon="mingcute:send-fill" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;