'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { chatApi } from '../services/chatApi';

interface User { _id: string; name?: string; username?: string; profilePic?: string }
interface Message { _id: string; sender: User; content: string; createdAt: string }
interface Chat { _id: string; members: User[]; lastMessage?: Message; isGroup: boolean; groupName?: string }

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Dedicated sidebar ChatList will handle group creation

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await chatApi.getUserChats();
      setChats(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="h-full bg-ambient">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
        <div className="flex items-center justify-between mb-4">
          
          <div />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading chats...</div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
        ) : chats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No chats yet.</div>
        ) : 
       
        (
        <div className='h-full w-full flex flex-col items-center justify-center'>
        <Icon icon="material-symbols:chat" className='w-12 h-12 text-gray-500' />
        <p className='text-lg font-semibold'>Start a chat or click on an existing chat to start messaging</p>
        </div>
        )}
      </div>

      {/* Group creation is handled in the dedicated ChatList sidebar */}
    </div>
  );
}
