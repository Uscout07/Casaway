//storyFeed.tsx
'use client';

import React, { useEffect, useState } from 'react';
import StoryViewerModal from './storyViewerModal'; // Adjust path as needed
import { fetchCurrentUser, fetchFeedStories, fetchMyStories } from './apiServices'; // Adjust path as needed
import { Story, User, StoryGroup } from './types'; // Adjust path as needed

export default function StoryFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialStoryGroupIndex, setInitialStoryGroupIndex] = useState(0);
  const [initialStoryIndexInGroup, setInitialStoryIndexInGroup] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      console.warn('No token found, user not authenticated.');
      return;
    }

    const loadData = async () => {
      const currentUser = await fetchCurrentUser(storedToken);
      setUser(currentUser);

      const [feedStories, userStories] = await Promise.all([
        fetchFeedStories(storedToken),
        fetchMyStories(storedToken),
      ]);
      setStories(feedStories);
      setMyStories(userStories);
    };

    loadData();
  }, []);

  const groupStories = (allStories: Story[], currentUser: User | null, userMyStories: Story[]): StoryGroup[] => {
    const grouped: StoryGroup[] = [];

    // Add current user's stories first
    if (currentUser && userMyStories.length > 0) {
      const activeMyStories = userMyStories.filter(s => new Date(s.expiresAt) > new Date());
      if (activeMyStories.length > 0) {
        grouped.push({
          userId: currentUser._id,
          username: currentUser.username,
          profilePic: currentUser.profilePic,
          stories: activeMyStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        });
      }
    }

    const otherUsersStoriesMap = new Map<string, Story[]>();
    allStories.forEach(story => {
      if (currentUser && story.user._id !== currentUser._id && new Date(story.expiresAt) > new Date()) {
        if (!otherUsersStoriesMap.has(story.user._id)) {
          otherUsersStoriesMap.set(story.user._id, []);
        }
        otherUsersStoriesMap.get(story.user._id)?.push(story);
      }
    });

    otherUsersStoriesMap.forEach((userStories, userId) => {
      userStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      grouped.push({
        userId: userId,
        username: userStories[0].user.username,
        profilePic: userStories[0].user.profilePic,
        stories: userStories,
      });
    });

    return grouped;
  };

  const groupedStories = groupStories(stories, user, myStories);

  const handleStoryCircleClick = (storyGroupUserId: string) => {
    const groupIndex = groupedStories.findIndex(group => group.userId === storyGroupUserId);
    if (groupIndex !== -1) {
      setInitialStoryGroupIndex(groupIndex);
      setInitialStoryIndexInGroup(0);
      setIsViewerOpen(true);
    } else {
      console.warn(`Story group for user ${storyGroupUserId} not found.`);
    }
  };

  const handleCreateStoryClick = () => {
    window.location.href = '/upload?mode=story';
  };

  if (!token || !user) {
    return <div className="text-center py-4 text-gray-500">Loading stories...</div>;
  }

  const myActiveStories = myStories.filter(s => new Date(s.expiresAt) > new Date());
  const hasMyStory = myActiveStories.length > 0;
  const myCurrentStoryThumbnail = hasMyStory ? myActiveStories[0].mediaUrl : user.profilePic;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; // Ensure it's never undefined

  return (
    <div className="flex gap-4 overflow-x-auto px-6 py-3 no-scrollbar">
      {/* User's Own Story / Create Story Button */}
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => hasMyStory ? handleStoryCircleClick(user._id) : handleCreateStoryClick()}
          className={`
            w-16 h-16 rounded-full border-2 p-0.5 relative flex items-center justify-center
            ${hasMyStory ? 'border-mint' : 'border-gray-300 border-dashed'}
            hover:scale-90 transition-transform duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-forest-medium focus:ring-offset-2
          `}
          aria-label={hasMyStory ? "View your story" : "Create a new story"}
        >
          {myCurrentStoryThumbnail ? (
            <div className="w-full h-full rounded-full overflow-hidden">
              <img
                src={myCurrentStoryThumbnail}
                alt="Your story"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span className="text-gray-500 text-3xl">+</span>
          )}
          {!hasMyStory && (
            <div className="absolute bottom-0 right-0 bg-forest text-white rounded-full p-1 text-xs leading-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}
        </button>
        <p className="text-xs mt-1 text-center text-gray-700 font-semibold">Your Story</p>
      </div>

      {/* Other users' stories */}
      {groupedStories.map((group) => {
        if (group.userId === user._id) {
          return null;
        }

        const latestStory = group.stories[0];
        const hasBeenViewedByCurrentUser = latestStory?.viewers.includes(user._id);

        return (
          <div key={group.userId} className="flex flex-col items-center shrink-0">
            <button
              onClick={() => handleStoryCircleClick(group.userId)}
              className={`
                w-16 h-16 rounded-full border-2 p-0.5 overflow-hidden
                ${hasBeenViewedByCurrentUser ? 'border-gray-400 opacity-70' : 'border-forest'}
                hover:scale-90 transition-transform duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-forest-medium focus:ring-offset-2
              `}
              aria-label={`View ${group.username}'s story`}
            >
              <img
                src={group.profilePic || 'https://placehold.co/64x64/E0E0E0/333333?text=User'}
                alt={group.username}
                className="w-full h-full object-cover"
              />
            </button>
            <p className="text-xs mt-1 text-center text-gray-700">{group.username}</p>
          </div>
        );
      })}

      {/* Story Viewer Modal */}
      {isViewerOpen && groupedStories.length > 0 && (
        <StoryViewerModal
          stories={groupedStories}
          initialStoryGroupIndex={initialStoryGroupIndex}
          initialStoryIndexInGroup={initialStoryIndexInGroup}
          onClose={() => setIsViewerOpen(false)}
          currentUserId={user._id}
          token={token}
          API_BASE_URL={API_BASE_URL}
        />
      )}
    </div>
  );
}