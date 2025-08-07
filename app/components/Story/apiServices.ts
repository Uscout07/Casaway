// apiService.ts
import axios from 'axios';
import { Story, User } from './types'; // Assuming interfaces are in a separate file

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL is not defined. Please set it in your environment variables.');
}

export const fetchCurrentUser = async (token: string): Promise<User | null> => {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error('Failed to fetch user:', res.statusText);
      return null;
    }
    const data = await res.json();
    return {
      ...data,
      _id: data._id?.toString() || data.id?.toString() || '',
    };
  } catch (err) {
    console.error('User fetch error', err);
    return null;
  }
};

export const fetchFeedStories = async (token: string): Promise<Story[]> => {
  if (!API_BASE_URL) return [];
  try {
    const feedRes = await axios.get(`${API_BASE_URL}/api/stories/feed`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return feedRes.data;
  } catch (err) {
    console.error('Feed story fetch error', err);
    return [];
  }
};

export const fetchMyStories = async (token: string): Promise<Story[]> => {
  if (!API_BASE_URL) return [];
  try {
    const myStoriesRes = await axios.get(`${API_BASE_URL}/api/stories/my-stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return myStoriesRes.data;
  } catch (err) {
    console.error('My stories fetch error', err);
    return [];
  }
};

export const markStoryAsViewed = async (storyId: string, token: string): Promise<void> => {
  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined, cannot mark story as viewed.');
    return;
  }
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
  } catch (error) {
    console.error('Failed to mark story as viewed:', error);
  }
};