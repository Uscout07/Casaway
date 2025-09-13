'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { chatApi } from '../../services/chatApi';

interface User { _id: string; name?: string; username?: string }
interface Message { _id: string; sender: User; content: string; createdAt: string; }
interface UserPopulated { _id: string; name?: string; profilePic?: string }
interface Chat {
  _id: string;
  members: UserPopulated[];
  isGroup: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastMessage?: { content: string; createdAt: string; updatedAt: string };
}

function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const load = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const data = await chatApi.getChatMessages(chatId);
      setMessages(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content) return;
    try {
      const sent = await chatApi.sendMessage(chatId, content);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (e) {
      // ignore for now
    }
  };

  const startEdit = (m: Message) => {
    setEditingId(m._id);
    setEditContent(m.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const content = editContent.trim();
    if (!content) return;
    try {
      const updated = await chatApi.editMessage(editingId, content);
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
      setEditingId(null);
      setEditContent('');
    } catch (_) {}
  };

  const delForMe = async (id: string) => {
    try {
      await chatApi.deleteForMe(id);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (_) {}
  };

  const delForAll = async (id: string) => {
    try {
      await chatApi.deleteForEveryone(id);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (_) {}
  };

  return (
    <div className="min-h-screen pt-[10vh] bg-ambient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => router.push('/messages')} className="mb-4 text-forest flex items-center gap-2">
          <Icon icon="mdi:arrow-left" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No messages yet.</div>
            ) : (
              messages.map(m => (
                <div key={m._id} className="group">
                  <div className="inline-block bg-gray-50 px-3 py-2 rounded-lg">
                    {editingId === m._id ? (
                      <input
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{m.content}</p>
                    )}
                    <div className="text-[10px] text-gray-400 text-right">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-2 ml-2 align-middle">
                    {editingId === m._id ? (
                      <>
                        <button onClick={saveEdit} className="text-forest text-xs">Save</button>
                        <button onClick={() => { setEditingId(null); setEditContent(''); }} className="text-gray-500 text-xs">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(m)} className="text-blue-600 text-xs">Edit</button>
                        <button onClick={() => delForAll(m._id)} className="text-red-600 text-xs">Delete All</button>
                        <button onClick={() => delForMe(m._id)} className="text-gray-600 text-xs">Delete Me</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="border-t p-3 flex items-center gap-2">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 text-sm"
            />
            <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-forest text-white px-4 py-2 rounded-full disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
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


const ErrorModal: React.FC<{
    message: string;
    onClose: () => void;
}> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Error</h3>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-forest text-white rounded-md hover:bg-pine transition-colors"
                    >
                        Close
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
    // Group management state
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [showEditGroupModal, setShowEditGroupModal] = useState(false);
    const [allUsers, setAllUsers] = useState<UserPopulated[]>([] as any);
    const [userSearch, setUserSearch] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [groupNameInput, setGroupNameInput] = useState('');
    const [groupDescriptionInput, setGroupDescriptionInput] = useState('');
    const [showGroupSettings, setShowGroupSettings] = useState(false);


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

    // Prefill edit modal fields when chat loads
    useEffect(() => {
        if (chat?.isGroup) {
            setGroupNameInput((chat as any)?.groupName || '');
            setGroupDescriptionInput((chat as any)?.groupDescription || '');
        }
    }, [chat]);

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

            {/* Chat Header */}
            <div 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border-b border-gray-200 flex-shrink-0 bg-ambient cursor-pointer"
                onClick={handleChatPartnerProfileClick}
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    {chat?.isGroup ? (
                        <Icon icon="mdi:account-group" className="w-6 h-6 sm:w-8 sm:h-8 text-forest" />
                    ) : chatPartnerProfilePic ? (
                        <img src={chatPartnerProfilePic} alt="Chat Partner" className="w-full h-full object-cover" />
                    ) : (
                        <Icon icon="material-symbols:person" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    )}
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-800 truncate">
                    {chat?.isGroup ? (chat as any)?.groupName || 'Group' : chatPartnerName}
                </h2>
                {chat?.isGroup && (
                    <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                            onClick={() => setShowGroupSettings(true)}
                        >
                            <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                        </button>
                    </div>
                )}
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
                   
                    <button
                        onClick={handleSendMessage}
                        className="bg-forest w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white hover:bg-pine ml-2 transition-colors flex-shrink-0"
                        disabled={!newMessageContent.trim()}
                    >
                        <Icon icon="mingcute:send-fill" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </button>
                </div>
            </div>

            {/* Group Settings Modal */}
            {showGroupSettings && chat?.isGroup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300]">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="text-lg font-semibold text-forest">Group Settings</div>
                            <button className="text-gray-600" onClick={() => setShowGroupSettings(false)}>Close</button>
                        </div>
                        <div className="p-4">
                            {/* Group Info */}
                            <div className="mb-6">
                                <div className="text-base font-semibold text-forest mb-3">Group Information</div>
                                <label className="text-sm text-gray-700">Group Name</label>
                                <input
                                    className="mt-1 w-full border rounded-md px-3 py-2 mb-3"
                                    value={groupNameInput}
                                    onChange={(e) => setGroupNameInput(e.target.value)}
                                />
                                <label className="text-sm text-gray-700">Group Description</label>
                                <textarea
                                    className="mt-1 w-full border rounded-md px-3 py-2 min-h-[72px]"
                                    value={groupDescriptionInput}
                                    onChange={(e) => setGroupDescriptionInput(e.target.value)}
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        className="px-4 py-2 rounded-md bg-forest text-white"
                                        onClick={async () => {
                                            try {
                                                await chatApi.updateGroupInfo(chatId, { groupName: groupNameInput.trim(), groupDescription: groupDescriptionInput.trim() });
                                                await fetchChatDetails();
                                            } catch (e: any) {
                                                displayErrorModal(e?.message || 'Failed to update group info');
                                            }
                                        }}
                                    >
                                        Update Group Info
                                    </button>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-base font-semibold text-forest">Members ({chat?.members?.length || 0})</div>
                                    <button
                                        className="px-3 py-2 rounded-md bg-forest text-white"
                                        onClick={async () => {
                                            try {
                                                const users = await chatApi.getAllUsers();
                                                setAllUsers(users);
                                                setUserSearch('');
                                                setSelectedUserIds([]);
                                                setShowAddMembersModal(true);
                                            } catch (e) {
                                                displayErrorModal('Failed to load users');
                                            }
                                        }}
                                    >
                                        Add Members
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {chat?.members?.map((member: any) => {
                                        const isAdminMember = Array.isArray((chat as any)?.admins) && (chat as any)?.admins?.some((a: any) => a._id === member._id);
                                        const isCurrentUser = member._id === loggedInUserId;
                                        return (
                                            <div key={member._id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center min-w-0">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                                                        {member.profilePic ? (
                                                            <img src={member.profilePic} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Icon icon="material-symbols:person" className="w-6 h-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-black truncate">{member.name}</div>
                                                            {isAdminMember && <span className="text-xs text-forest px-2 py-0.5 bg-green-100 rounded">Admin</span>}
                                                            {isCurrentUser && <span className="text-xs text-blue-600 px-2 py-0.5 bg-blue-100 rounded">You</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-600 truncate">{member.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!isCurrentUser && (
                                                        <>
                                                            {isAdminMember ? (
                                                                <button
                                                                    className="text-xs text-red-600 hover:underline"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await chatApi.removeAdminFromGroup(chatId, member._id);
                                                                            await fetchChatDetails();
                                                                        } catch (e: any) {
                                                                            displayErrorModal(e?.message || 'Failed to remove admin');
                                                                        }
                                                                    }}
                                                                >
                                                                    Remove Admin
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="text-xs text-forest hover:underline"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await chatApi.addAdminToGroup(chatId, member._id);
                                                                            await fetchChatDetails();
                                                                        } catch (e: any) {
                                                                            displayErrorModal(e?.message || 'Failed to make admin');
                                                                        }
                                                                    }}
                                                                >
                                                                    Make Admin
                                                                </button>
                                                            )}
                                                            <button
                                                                className="text-xs text-red-600 hover:underline"
                                                                onClick={async () => {
                                                                    try {
                                                                        await chatApi.removeMembersFromGroup(chatId, [member._id]);
                                                                        await fetchChatDetails();
                                                                    } catch (e: any) {
                                                                        displayErrorModal(e?.message || 'Failed to remove member');
                                                                    }
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Leave Group */}
                            <div className="flex justify-end">
                                <button
                                    className="px-4 py-2 rounded-md bg-red-500 text-white"
                                    onClick={async () => {
                                        try {
                                            await chatApi.leaveGroup(chatId);
                                            setShowGroupSettings(false);
                                            router.push('/messages');
                                        } catch (e: any) {
                                            displayErrorModal(e?.message || 'Failed to leave group');
                                        }
                                    }}
                                >
                                    Leave Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Members Modal */}
            {showAddMembersModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Members</h3>
                        <input
                            className="w-full border rounded-md px-3 py-2 mb-3"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                        <div className="max-h-64 overflow-y-auto border rounded">
                            {allUsers
                                .filter(u => (u.name || '').toLowerCase().includes(userSearch.toLowerCase()))
                                .map(u => {
                                    const checked = selectedUserIds.includes(u._id);
                                    return (
                                        <label key={u._id} className="flex items-center gap-2 p-2 border-b last:border-b-0 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => setSelectedUserIds(prev => checked ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                                            />
                                            <span className="text-sm text-gray-800">{u.name}</span>
                                        </label>
                                    );
                                })}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button className="px-4 py-2 rounded-md bg-gray-200" onClick={() => setShowAddMembersModal(false)}>Cancel</button>
                            <button
                                className="px-4 py-2 rounded-md bg-forest text-white"
                                onClick={async () => {
                                    try {
                                        if (selectedUserIds.length === 0) return setShowAddMembersModal(false);
                                        await chatApi.addMembersToGroup(chatId, selectedUserIds);
                                        setShowAddMembersModal(false);
                                        setSelectedUserIds([]);
                                        fetchChatDetails();
                                    } catch (e: any) {
                                        displayErrorModal(e?.message || 'Failed to add members');
                                    }
                                }}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Group Info Modal */}
            {showEditGroupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1300]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Group Info</h3>
                        <label className="text-sm text-gray-700">Group Name</label>
                        <input
                            className="mt-1 w-full border rounded-md px-3 py-2 mb-4"
                            value={groupNameInput}
                            onChange={(e) => setGroupNameInput(e.target.value)}
                        />
                        <label className="text-sm text-gray-700">Description</label>
                        <textarea
                            className="mt-1 w-full border rounded-md px-3 py-2 min-h-[72px]"
                            value={groupDescriptionInput}
                            onChange={(e) => setGroupDescriptionInput(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button className="px-4 py-2 rounded-md bg-gray-200" onClick={() => setShowEditGroupModal(false)}>Cancel</button>
                            <button
                                className="px-4 py-2 rounded-md bg-forest text-white"
                                onClick={async () => {
                                    try {
                                        await chatApi.updateGroupInfo(chatId, { groupName: groupNameInput.trim(), groupDescription: groupDescriptionInput.trim() });
                                        setShowEditGroupModal(false);
                                        fetchChatDetails();
                                    } catch (e: any) {
                                        displayErrorModal(e?.message || 'Failed to update group');
                                    }
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;