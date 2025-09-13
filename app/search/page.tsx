'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import PostModal from '../components/postModal';

interface User {
  _id: string;
  username: string;
  name?: string;
  profilePic?: string;
}

interface Post {
  _id: string;
  caption: string;
  tags: string[];
  city: string;
  country: string;
  imageUrl: string;
  images: string[];
  user: User;
  createdAt: string;
}

interface Suggestion {
  type: 'post' | 'tag' | 'user';
  data: Post | string | User;
  displayText: string;
  subtitle?: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [recommended, setRecommended] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    fetchRecommendations();
  }, []);

  const fetchPosts = async (searchParams?: { tags?: string; city?: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams?.tags) params.append('tags', searchParams.tags);
      if (searchParams?.city) params.append('city', searchParams.city);

      const response = await fetch(`${API_BASE_URL}/api/posts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '';
      // Try dedicated recommendations endpoint if available
      const recRes = await fetch(`${API_BASE_URL}/api/posts/recommendations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommended(recData);
        return;
      }

      // Fallback: derive top tags from recent posts and fetch more by those tags
      const tagCounts: Record<string, number> = {};
      posts.forEach(p => (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t]) => t);

      if (topTags.length > 0) {
        const params = new URLSearchParams({ tags: topTags.join(',') });
        const res = await fetch(`${API_BASE_URL}/api/posts?${params.toString()}`);
        if (res.ok) setRecommended(await res.json());
      } else {
        // Last resort: just show latest posts
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (res.ok) setRecommended(await res.json());
      }
    } catch (e) {
      // silent
    } finally {
      setRecLoading(false);
    }
  };

  const searchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const [postsRes, tagsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/posts?city=${encodeURIComponent(searchQuery)}`),
        fetch(`${API_BASE_URL}/api/posts/search/tags?query=${encodeURIComponent(searchQuery)}`),
        fetch(`${API_BASE_URL}/api/users/search/users?query=${encodeURIComponent(searchQuery)}`)
      ]);

      const [postsData, tagsData, usersData] = await Promise.all([
        postsRes.ok ? postsRes.json() : [],
        tagsRes.ok ? tagsRes.json() : [],
        usersRes.ok ? usersRes.json() : []
      ]);

      const newSuggestions: Suggestion[] = [];

      postsData.slice(0, 3).forEach((post: Post) => {
        newSuggestions.push({
          type: 'post',
          data: post,
          displayText: post.caption.slice(0, 50),
          subtitle: `${post.city}, ${post.country} • @${post.user.username}`
        });
      });

      tagsData.slice(0, 5).forEach((tag: string) => {
        newSuggestions.push({
          type: 'tag',
          data: tag,
          displayText: `#${tag}`,
          subtitle: 'Tag'
        });
      });

      usersData.slice(0, 3).forEach((user: User) => {
        newSuggestions.push({
          type: 'user',
          data: user,
          displayText: user.name || user.username,
          subtitle: `@${user.username}`
        });
      });

      setSuggestions(newSuggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedSearch = useCallback(
    debounce((val: string) => searchSuggestions(val), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    debouncedSearch(e.target.value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'user') {
      const user = suggestion.data as User;
      router.push(`/profile/${user._id}`);
    } else if (suggestion.type === 'tag') {
      const tag = suggestion.data as string;
      setQuery(`#${tag}`);
      setShowSuggestions(false);
      fetchPosts({ tags: tag });
    } else if (suggestion.type === 'post') {
      const post = suggestion.data as Post;
      setSelectedPost(post);
      setModalOpen(true);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'post': return 'material-symbols:image-outline';
      case 'tag': return 'mdi:tag';
      case 'user': return 'mdi:account';
      default: return 'mdi:search';
    }
  };

  return (
    <div className="min-h-screen bg-ambient px-4 pt-[11vh]">
      <div className="flex justify-center">
      <div className="relative w-[312px] lg:w-[735px]">
        <Icon
                  icon="mdi:search"
                  className="text-coral w-[25px] h-[25px] lg:w-[32px] lg:[32px] absolute left-4 top-1/2 -translate-y-1/2 z-10"
                />
        <input
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search posts, tags (#tag), or city"
          className="w-[312px] lg:w-full rounded-[40px] bg-white pl-12 lg:pl-16 pr-6 py-4 shadow-lg"
        />
      </div>
      </div>
      {showSuggestions && (
        <div className="max-w-xl mx-auto bg-white mt-2 shadow rounded-md border z-50">
          {suggestions.map((sugg, i) => (
            <div
              key={i}
              onClick={() => handleSuggestionClick(sugg)}
              className="flex p-3 hover:bg-gray-100 cursor-pointer items-center gap-2 border-b"
            >
              <Icon icon={getSuggestionIcon(sugg.type)} className="text-gray-500" />
              <div>
                <div className="font-medium">{sugg.displayText}</div>
                <div className="text-xs text-gray-400">{sugg.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}


      {!loading && (
        <div className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {posts.map((post) => (
            <div
              key={post._id}
              className="aspect-square overflow-hidden cursor-pointer"
              onClick={() => {
                setSelectedPost(post);
                setModalOpen(true);
              }}
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {selectedPost && modalOpen && (
        <PostModal
          post={selectedPost}
          modalOpen={modalOpen}
          onClose={() => {
            setSelectedPost(null);
            setModalOpen(false);
          }}
          token={typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}
        />
      )}
    </div>
  );
};

export default SearchPage;
