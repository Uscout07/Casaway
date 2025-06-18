// StoryViewerModal.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Story, StoryGroup, StoryViewerModalProps } from './types'; // Adjust path as needed
import { markStoryAsViewed } from './apiServices'; // Adjust path as needed

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

  const currentStoryGroup = allStoryGroups[currentGroupIndex];
  const currentStory = currentStoryGroup?.stories[currentStoryIndex];

  const handleMarkStoryAsViewed = useCallback(async (storyId: string) => {
    await markStoryAsViewed(storyId, token);
  }, [token]);

  const goToNextStory = useCallback(() => {
    if (!currentStoryGroup || !currentStory) return;

    if (!currentStory.viewers.includes(currentUserId)) {
      handleMarkStoryAsViewed(currentStory._id);
    }

    if (currentStoryIndex < currentStoryGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgressBarWidth(0);
    } else if (currentGroupIndex < allStoryGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgressBarWidth(0);
    } else {
      onClose();
    }
  }, [currentStoryGroup, currentStoryIndex, currentGroupIndex, allStoryGroups, onClose, handleMarkStoryAsViewed, currentStory, currentUserId]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgressBarWidth(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = allStoryGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgressBarWidth(0);
    }
  }, [currentStoryIndex, currentGroupIndex, allStoryGroups]);

  useEffect(() => {
    if (!currentStory) {
      onClose();
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / STORY_DURATION_MS) * 100;
      setProgressBarWidth(Math.min(progress, 100));

      if (progress >= 100) {
        goToNextStory();
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStory, goToNextStory, onClose]);

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

  if (!currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-2 sm:p-4 lg:p-8 mb-2 max-md:h-[92vh]">
      <div className="relative w-full h-full max-w-xl max-h-[90vh rounded-lg overflow-hidden flex flex-col">
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
        <div className="h-full flex items-center justify-center bg-black">
          {currentStory.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? (
            <video
              key={currentStory._id}
              src={currentStory.mediaUrl}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              onEnded={goToNextStory}
              onLoadedData={() => setProgressBarWidth(0)}
            />
          ) : (
            <img
              key={currentStory._id}
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story media'}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute md:bottom-0 bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent  text-white text-center md:pb-8  z-40">
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

export default StoryViewerModal;