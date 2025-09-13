'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
// Removed 'next/navigation' import to resolve compilation error
// Using window.location.href for redirection

// Interface definitions (re-defined or extended here for clarity within this single file context)
interface Story {
  createdAt: any;
  _id: string;
  mediaUrl: string;
  caption?: string;
  user: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  expiresAt: string;
  viewers: string[];
}

interface User {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
}

interface StoryGroup {
  userId: string;
  username: string;
  profilePic?: string;
  stories: Story[];
}

// --- StoryViewerModal Component (now defined within the same file) ---
interface StoryViewerModalProps {
  stories: StoryGroup[];
  initialStoryGroupIndex: number;
  initialStoryIndexInGroup: number;
  onClose: () => void;
  currentUserId: string;
  token: string;
  API_BASE_URL: string;
}

const STORY_DURATION_MS = 5000; // 5 seconds per story segment

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories: allStoryGroups,
  initialStoryGroupIndex,
  initialStoryIndexInGroup,
  onClose,
  currentUserId,
  token,
  API_BASE_URL,
}) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialStoryGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndexInGroup);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get the currently active story group and story
  const currentStoryGroup = allStoryGroups[currentGroupIndex];
  const currentStory = currentStoryGroup?.stories[currentStoryIndex];

  // Log current story media URL whenever it changes
  useEffect(() => {
    if (currentStory) {
      console.log("Currently viewing story URL:", currentStory.mediaUrl);
    }
  }, [currentStory]);

  // Function to mark a story as viewed
  const markStoryAsViewed = useCallback(async (storyId: string) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/stories/${storyId}/view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`Story ${storyId} marked as viewed.`);
      // In a real application, you might want to re-fetch stories or update local state
      // to reflect the 'viewed' status in the StoryFeed component.
    } catch (error) {
      console.error('Failed to mark story as viewed:', error);
    }
  }, [API_BASE_URL, token]);

  // Handle advancing to the next story segment or next user's story
  const goToNextStory = useCallback(() => {
    if (!currentStoryGroup || !currentStory) return;

    // Mark current story as viewed when advancing, if not already viewed by current user
    if (!currentStory.viewers.includes(currentUserId)) {
      markStoryAsViewed(currentStory._id);
    }

    if (currentStoryIndex < currentStoryGroup.stories.length - 1) {
      // Go to the next story in the current group
      setCurrentStoryIndex(prev => prev + 1);
      setProgressBarWidth(0); // Reset progress bar for the new story
    } else if (currentGroupIndex < allStoryGroups.length - 1) {
      // Go to the next user's story group
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0); // Start from the first story in the new group
      setProgressBarWidth(0); // Reset progress bar
    } else {
      // All stories viewed, close the modal
      onClose();
    }
  }, [currentStoryGroup, currentStoryIndex, currentGroupIndex, allStoryGroups, onClose, markStoryAsViewed, currentStory, currentUserId]);

  // Handle going to the previous story segment or previous user's story
  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      // Go to the previous story in the current group
      setCurrentStoryIndex(prev => prev - 1);
      setProgressBarWidth(0); // Reset progress bar
    } else if (currentGroupIndex > 0) {
      // Go to the previous user's story group
      setCurrentGroupIndex(prev => prev - 1);
      // Go to the last story in the previous group
      const prevGroup = allStoryGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgressBarWidth(0); // Reset progress bar
    } else {
      // Already at the very first story, do nothing or close
      // For now, stay on the first story
    }
  }, [currentStoryIndex, currentGroupIndex, allStoryGroups]);

  // Effect for automatic story progression and progress bar
  useEffect(() => {
    if (!currentStory) {
      onClose(); // If no story found, close the modal (e.g., if all filtered out)
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start a new timer for the current story
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / STORY_DURATION_MS) * 100;
      setProgressBarWidth(Math.min(progress, 100));

      if (progress >= 100) {
        goToNextStory();
      }
    }, 50); // Update progress bar every 50ms

    // Cleanup interval on component unmount or when story changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStory, goToNextStory, onClose]);

  // Close modal on Escape key, navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        goToNextStory();
      } else if (event.key === 'ArrowLeft') {
        goToPreviousStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, goToNextStory, goToPreviousStory]);


  if (!currentStory) {
    return null; // Should not happen if `groupedStories` is checked before rendering modal
  }

  // Preload next media for smoother transition
  useEffect(() => {
    if (currentStoryGroup && currentStoryIndex < currentStoryGroup.stories.length - 1) {
      const nextStory = currentStoryGroup.stories[currentStoryIndex + 1];
      const img = new Image();
      img.src = nextStory.mediaUrl;
    } else if (currentGroupIndex < allStoryGroups.length - 1) {
      const nextGroup = allStoryGroups[currentGroupIndex + 1];
      if (nextGroup && nextGroup.stories.length > 0) {
        const nextStoryInNextGroup = nextGroup.stories[0];
        const img = new Image();
        img.src = nextStoryInNextGroup.mediaUrl;
      }
    }
  }, [currentStoryIndex, currentGroupIndex, currentStoryGroup, allStoryGroups]);



  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-2 sm:p-4 lg:p-8 mb-2">
      {/* Story Content Area */}
      <div className="relative w-full h-full max-w-xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition"
          aria-label="Close story viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* User Info and Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-4 z-40">
          <div className="flex space-x-1 mb-2">
            {currentStoryGroup.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${index < currentStoryIndex ? 100 : index === currentStoryIndex ? progressBarWidth : 0}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex items-center text-white">
            <img
              src={currentStoryGroup.profilePic || 'https://placehold.co/40x40/E0E0E0/333333?text=User'}
              alt={currentStoryGroup.username}
              className="w-10 h-10 rounded-full border-2 border-white object-cover mr-3"
            />
            <div>
              <p className="font-semibold text-lg">{currentStoryGroup.username}</p>
              <p className="text-xs text-gray-300">
                {currentStory.createdAt ? new Date(currentStory.createdAt).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        {/* Media (Image/Video) */}
        <div className="flex-grow flex items-center justify-center bg-black">
          {currentStory.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
            <video
              key={currentStory._id} // Key to force re-render/reload for new video
              src={currentStory.mediaUrl}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted // Usually stories start muted
              onEnded={goToNextStory} // Advance on video end
              onLoadedData={() => setProgressBarWidth(0)} // Reset progress when video loads
            />
          ) : (
            <img
              key={currentStory._id} // Key to force re-render for new image
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story media'}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
        

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white text-center pb-8 z-40">
            <p className="text-base sm:text-lg">{currentStory.caption}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 w-full flex justify-between items-center md:px-2 z-30">
          <button
            onClick={goToPreviousStory}
            className="md:p-3 text-white bg-black bg-opacity-30 rounded-full md:hover:bg-opacity-50 transition max-md:h-full max-md:w-1/3 max-md:opacity-0"
            aria-label="Previous story"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextStory}
            className="md:p-3 text-white bg-black bg-opacity-30 rounded-full md:hover:bg-opacity-50 transition max-md:h-full max-md:w-1/3 max-md:opacity-0"
            aria-label="Next story"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- StoryFeed Component (main component for this file) ---
export default function StoryFeed() {
  console.log('--- StoryFeed Component Rendered ---');
  const [stories, setStories] = useState<Story[]>([]); // Stories from followed users
  const [myStories, setMyStories] = useState<Story[]>([]); // Current user's stories
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // State for the Story Viewer Modal
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialStoryGroupIndex, setInitialStoryGroupIndex] = useState(0); // Index of the user group to start with
  const [initialStoryIndexInGroup, setInitialStoryIndexInGroup] = useState(0); // Index of the story within that group

  useEffect(() => {
    console.log('--- StoryFeed useEffect triggered ---');
    const storedToken = localStorage.getItem('token');
    console.log('Stored Token:', storedToken ? 'Token found' : 'No token found');
    setToken(storedToken);

    if (!storedToken) {
      console.warn('No token found, user not authenticated.');
      return;
    }

    const API_BASE_URL = '/api';

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch user:', res.statusText);
          return;
        }

        const data = await res.json();
        setUser({
          ...data,
          _id: data._id?.toString() || data.id?.toString() || '',
        });
      } catch (err) {
        console.error('User fetch error', err);
      }
    };

    const fetchStories = async () => {
      try {
        // Fetch stories from followed users
        const feedRes = await axios.get(`${API_BASE_URL}/api/stories/feed`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        console.log('--- Story Feed API Response ---');
        console.log('Followed Users Stories:', feedRes.data);
        feedRes.data.forEach((story: Story) => {
          console.log("Feed Story URL:", story.mediaUrl);
        });
        setStories(feedRes.data);

        // Fetch current user's own stories
        const myStoriesRes = await axios.get(`${API_BASE_URL}/api/stories/my-stories`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        console.log("Current User's Stories:", myStoriesRes.data);
        myStoriesRes.data.forEach((story: Story) => {
          console.log("My Story URL:", story.mediaUrl);
        });
        setMyStories(myStoriesRes.data);

      } catch (err) {
        console.error('Story fetch error', err);
      }
    };

    fetchUser();
    fetchStories();
  }, []);


  // Group stories by user for the viewer modal
  const groupedStories: StoryGroup[] = [];

  // Add current user's stories first if they exist and are active
  if (user && myStories.length > 0) {
    const activeMyStories = myStories.filter(s => new Date(s.expiresAt) > new Date());
    if (activeMyStories.length > 0) {
      groupedStories.push({
        userId: user._id,
        username: user.username,
        profilePic: user.profilePic,
        stories: activeMyStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort newest first
      });
    }
  }

  // Add other users' stories, grouped
  const otherUsersStoriesMap = new Map<string, Story[]>();
  stories.forEach(story => {
    // Only add if not current user's story and not expired
    if (user && story.user._id !== user._id && new Date(story.expiresAt) > new Date()) {
      if (!otherUsersStoriesMap.has(story.user._id)) {
        otherUsersStoriesMap.set(story.user._id, []);
      }
      otherUsersStoriesMap.get(story.user._id)?.push(story);
    }
  });

  otherUsersStoriesMap.forEach((userStories, userId) => {
    // Sort stories within each group by createdAt to show newest first
    userStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    groupedStories.push({
      userId: userId,
      username: userStories[0].user.username, // Take username from the first story
      profilePic: userStories[0].user.profilePic, // Take profilePic from the first story
      stories: userStories,
    });
  });


  // This function is now responsible for opening the StoryViewerModal
  const handleStoryCircleClick = (storyGroupUserId: string) => {
    const groupIndex = groupedStories.findIndex(group => group.userId === storyGroupUserId);
    if (groupIndex !== -1) {
      setInitialStoryGroupIndex(groupIndex);
      setInitialStoryIndexInGroup(0); // Always start from the first story in the clicked group
      setIsViewerOpen(true);
    } else {
      console.warn(`Story group for user ${storyGroupUserId} not found.`);
    }
  };

  // This function is for creating a new story (redirects to upload page)
  const handleCreateStoryClick = () => {
    window.location.href = '/upload?mode=story';
  };


  if (!token || !user) {
    return <div className="text-center py-4 text-gray-500">Loading stories...</div>;
  }

  // Determine if the current user has an active story
  const myActiveStories = myStories.filter(s => new Date(s.expiresAt) > new Date());
  const hasMyStory = myActiveStories.length > 0;
  const myCurrentStoryThumbnail = hasMyStory ? myActiveStories[0].mediaUrl : user.profilePic;

  console.log("--- DEBUG: My Stories from API ---", myStories);
console.log("--- DEBUG: My Active Stories ---", myActiveStories);
console.log("--- DEBUG: My Story Thumbnail ---", myCurrentStoryThumbnail);


  return (
    <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
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
            <span className="text-gray-500 text-3xl">+</span> // Plus icon for creating
          )}
          {/* Plus icon for adding story if no profile pic or fallback */}
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
        // Skip current user's story if it's already displayed in "Your Story" section
        if (group.userId === user._id) {
          return null;
        }

        // Determine if the current user has viewed the latest story in this group
        const latestStory = group.stories[0]; // Assuming stories are sorted newest first
        const hasBeenViewedByCurrentUser = latestStory?.viewers.includes(user._id);

        return (
          <div key={group.userId} className="flex flex-col items-center shrink-0">
            <button
              onClick={() => handleStoryCircleClick(group.userId)} // Pass the user ID to the handler
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
          API_BASE_URL={process.env.NEXT_PUBLIC_API_URL || ''}
        />
      )}
    </div>
  );
}