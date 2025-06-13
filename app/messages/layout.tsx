// app/chat/layout.tsx - Responsive Chat Layout
import React from 'react';
import ChatList from './ChatList';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-[100vh] pt-[10vh] bg-ambient text-forest">
      {/* Sidebar for chat list - responsive visibility */}
      <div className="hidden lg:flex w-1/3 xl:w-1/4 min-w-[280px] max-w-[400px] bg-ambient flex-col border-r border-gray-200">
        <ChatList />
      </div>

      {/* Main content area - responsive width */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;