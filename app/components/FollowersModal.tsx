'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface User {
  _id: string;
  name: string;
  username: string;
  profilePic?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  isMyProfile: boolean;
  onFollowToggle?: (userId: string) => void;
  onRemoveFollower?: (userId: string) => void;
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  isMyProfile,
  onFollowToggle,
  onRemoveFollower
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'username' | 'recent'>('name');
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      
      // Fetch follow statuses for each user if not my profile
      if (!isMyProfile) {
        await fetchFollowStatuses(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatuses = async (userList: User[]) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const statusPromises = userList.map(async (user) => {
        const response = await fetch(`${API_BASE_URL}/api/follow/status/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return { userId: user._id, isFollowing: data.isFollowing };
        }
        return { userId: user._id, isFollowing: false };
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = statuses.reduce((acc, status) => {
        acc[status.userId] = status.isFollowing;
        return acc;
      }, {} as Record<string, boolean>);
      
      setFollowStatuses(statusMap);
    } catch (err) {
      console.error('Error fetching follow statuses:', err);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!onFollowToggle) return;
    
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await onFollowToggle(targetUserId);
      setFollowStatuses(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId]
      }));
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleRemoveFollower = async (targetUserId: string) => {
    if (!onRemoveFollower) return;
    
    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await onRemoveFollower(targetUserId);
      setUsers(prev => prev.filter(user => user._id !== targetUserId));
    } catch (err) {
      console.error('Error removing follower:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'recent':
          // For recent, we'll keep the original order (most recent first)
          return 0;
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchTerm('');
    }
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-forest/60 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-forest">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="material-symbols:close" className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Sort */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Icon 
              icon="material-symbols:search" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
            />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'username' | 'recent')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="username">Sort by Username</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No users found matching your search.' : `No ${type} found.`}
            </div>
          ) : (
            <div className="p-2">
              {filteredAndSortedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon icon="material-symbols:person" className="w-full h-full text-gray-400" />
                      )}
                    </div>
                     <div>
                       <p className="font-medium text-forest">{user.name || 'Unknown User'}</p>
                       <p className="text-sm text-gray-500">@{user.username || 'unknown'}</p>
                     </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isMyProfile && type === 'followers' && (
                      <button
                        onClick={() => handleRemoveFollower(user._id)}
                        disabled={actionLoading[user._id]}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50"
                      >
                        {actionLoading[user._id] ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Remove'
                        )}
                      </button>
                    )}
                    
                    {!isMyProfile && (
                      <button
                        onClick={() => handleFollowToggle(user._id)}
                        disabled={actionLoading[user._id]}
                        className={`px-3 py-1 text-sm rounded-full disabled:opacity-50 ${
                          followStatuses[user._id]
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-forest text-white hover:bg-teal-800'
                        }`}
                      >
                        {actionLoading[user._id] ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          followStatuses[user._id] ? 'Unfollow' : 'Follow'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
