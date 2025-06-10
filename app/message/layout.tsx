// app/chat/layout.tsx
import React from 'react';
import ChatList from './ChatList'; // We'll create this component soon

interface ChatLayoutProps {
  children: React.ReactNode; // This will be the active chat page ([id]/page.tsx) or the default chat list (page.tsx)
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-[100vh] pt-[10vh] bg-ambient text-forest">
      {/* Sidebar for chat list - visible on larger screens */}
      <div className="hidden md:flex w-1/4 min-w-[300px] bg-ambient flex-col">
        <ChatList />
      </div>

      {/* Main content area for active chat or full list on small screens */}
      <div className="flex-1 flex flex-col">
        {children} {/* This is where app/chat/[id]/page.tsx or app/chat/page.tsx will render */}
      </div>
    </div>
  );
};

export default ChatLayout;