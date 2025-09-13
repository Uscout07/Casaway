'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import ChatList from './ChatList';

interface ChatLayoutProps {
  children: React.ReactNode;
}


const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isDefaultChatPage = pathname === '/messages';
  const isChatDetailPage = pathname.startsWith('/messages/') && pathname !== '/messages';
  


  return (
    <div className="chat flex h-[90vh] pt-[10vh] md:h-[100vh] bg-ambient text-forest">
      {/* Desktop: Always show sidebar */}
      <div className="hidden lg:flex w-1/3 xl:w-1/4 min-w-[280px] max-w-[400px] bg-ambient flex-col border-r border-gray-200">
        <ChatList />
      </div>

      {/* Mobile & Tablet: Show chat list on default page, hide on chat detail page */}
      {isDefaultChatPage && (
        <div className="flex lg:hidden w-full bg-ambient flex-col">
          <ChatList />
        </div>
      )}

      {/* Desktop: Always show main content area */}
      {/* Mobile: Only show when on a specific chat page */}
      <div className={`flex-1 flex-col min-w-0 ${
        isDefaultChatPage ? 'hidden lg:flex' : 'flex'
      }`}>
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;