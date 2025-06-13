'use client';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import ChatList from './ChatList';

const DefaultChatPage = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isLargeScreen) return <ChatList/>; // Hide on md/sm screens

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-ambient text-gray-600 p-4 max-h-[90vh] overflow-hidden">
      <Icon icon="material-symbols:chat-bubble-outline" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6 text-gray-400" />
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">Select a Chat to Start Messaging</h2>
      <p className="text-center max-w-sm sm:max-w-md text-sm sm:text-base px-4">
        Choose a conversation from the left sidebar to view messages or start a new chat from a user's profile.
      </p>
    </div>
  );
};

export default DefaultChatPage;
