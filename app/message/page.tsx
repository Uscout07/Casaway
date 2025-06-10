// app/chat/page.tsx
'use client';
import { Icon } from '@iconify/react';

// This is the default content for /chat when no specific chat is selected.
// It will be rendered inside the app/chat/layout.tsx
const DefaultChatPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-ambient text-gray-600 p-4 max-h-[90vh] overflow-hidden">
      <Icon icon="material-symbols:chat-bubble-outline" className="w-24 h-24 mb-6 text-gray-400" />
      <h2 className="text-2xl font-bold mb-2">Select a Chat to Start Messaging</h2>
      <p className="text-center max-w-md">
        Choose a conversation from the left sidebar to view messages or start a new chat from a user's profile.
      </p>
    </div>
  );
};

export default DefaultChatPage;