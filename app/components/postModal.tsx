'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon } from '@iconify/react';

interface User {
  _id: string;
  username: string;
  name?: string;
  profilePic?: string;
}

interface Comment {
  _id: string;
  user: User;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  replies?: Comment[];
  isLikedByUser?: boolean;
  likesCount?: number;
}

interface Post {
  _id: string;
  user: User;
  image?: string;
  imageUrl?: string;
  caption?: string;
  tags?: string[];
}

interface PostModalProps {
  post: Post;
  modalOpen: boolean;
  onClose: () => void;
  token: string;
}

export default function PostModal({ post, modalOpen, onClose, token }: PostModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption || '');
  const [editedTags, setEditedTags] = useState<string[]>(post.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getImageUrl = () => {
    return post.image || post.imageUrl || '';
  };

  useEffect(() => {
    if (!modalOpen) return;

    const fetchEverything = async () => {
      setLoading(true);
      try {
        // Fetch current user id for edit permission
        try {
          const meRes = await axios.get(`${API_BASE_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes?.data?._id) setCurrentUserId(meRes.data._id);
        } catch (_) {
          setCurrentUserId(null);
        }

        const [postLikeRes, saveRes, commentRes, postLikeCountRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/likes/status/${post._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { isLiked: false } })),
          axios.get(`${API_BASE_URL}/api/saved-posts/status/${post._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { isSaved: false } })),
          axios.get(`${API_BASE_URL}/api/comments/${post._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { comments: [] } })),
          axios.get(`${API_BASE_URL}/api/likes/count/post/${post._id}`)
            .catch(() => ({ data: { count: 0 } })),
        ]);

        setIsLiked(postLikeRes.data.isLiked);
        setIsSaved(saveRes.data.isSaved);
        setPostLikeCount(postLikeCountRes.data.count);

        const fetchedComments: Comment[] = commentRes.data.comments || [];

        const commentsWithLikes = await Promise.all(
          fetchedComments.map(async (comment) => {
            const [likeStatusRes, likeCountRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/api/likes/status/comment/${comment._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => ({ data: { isLiked: false } })),
              axios.get(`${API_BASE_URL}/api/likes/count/comment/${comment._id}`).catch(() => ({ data: { count: 0 } })),
            ]);

            const repliesWithLikes = await Promise.all(
              (comment.replies || []).map(async (reply) => {
                const [replyLikeStatusRes, replyLikeCountRes] = await Promise.all([
                  axios.get(`${API_BASE_URL}/api/likes/status/comment/${reply._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  }).catch(() => ({ data: { isLiked: false } })),
                  axios.get(`${API_BASE_URL}/api/likes/count/comment/${reply._id}`).catch(() => ({ data: { count: 0 } })),
                ]);
                return {
                  ...reply,
                  isLikedByUser: replyLikeStatusRes.data.isLiked,
                  likesCount: replyLikeCountRes.data.count,
                };
              })
            );

            return {
              ...comment,
              isLikedByUser: likeStatusRes.data.isLiked,
              likesCount: likeCountRes.data.count,
              replies: repliesWithLikes,
            };
          })
        );
        setComments(commentsWithLikes);

      } catch (err) {
        console.error('Error loading post details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [modalOpen, post._id, token, API_BASE_URL]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedCaption(post.caption || '');
    setEditedTags(post.tags || []);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCaption(post.caption || '');
    setEditedTags(post.tags || []);
    setNewTag('');
  };

  const handleSaveEdit = async () => {
    const trimmed = editedCaption.trim();
    if (!trimmed) return;
    setIsSavingEdit(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/posts/${post._id}`,
        { caption: trimmed, tags: editedTags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        post.caption = trimmed;
        post.tags = editedTags;
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save post edit:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !editedTags.includes(trimmedTag) && editedTags.length < 10) {
      setEditedTags([...editedTags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        onClose(); // Close the modal after successful deletion
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/likes/toggle/post/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);
      setPostLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error toggling post like:', err);
    }
  };

  const toggleSave = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/saved-posts/toggle/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(res.data.saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/likes/toggle/comment/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLikedByUser: res.data.liked,
              likesCount: res.data.likesCount,
            };
          }
          const updatedReplies = comment.replies?.map(reply => {
            if (reply._id === commentId) {
              return {
                ...reply,
                isLikedByUser: res.data.liked,
                likesCount: res.data.likesCount,
              };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        })
      );
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comments/${post._id}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const [likeStatusRes, likeCountRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/likes/status/comment/${res.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { isLiked: false } })),
        axios.get(`${API_BASE_URL}/api/likes/count/comment/${res.data._id}`).catch(() => ({ data: { count: 0 } })),
      ]);

      setComments(prev => [
        {
          ...res.data,
          isLikedByUser: likeStatusRes.data.isLiked,
          likesCount: likeCountRes.data.count,
        },
        ...prev,
      ]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comments/${post._id}`,
        {
          content: replyText,
          parentCommentId: parentCommentId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const [likeStatusRes, likeCountRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/likes/status/comment/${res.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { isLiked: false } })),
        axios.get(`${API_BASE_URL}/api/likes/count/comment/${res.data._id}`).catch(() => ({ data: { count: 0 } })),
      ]);

      setComments(prev => prev.map(comment => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), {
              ...res.data,
              isLikedByUser: likeStatusRes.data.isLiked,
              likesCount: likeCountRes.data.count,
            }]
          };
        }
        return comment;
      }));

      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex justify-center items-center px-2 py-4 sm:px-4 overflow-y-auto">
  <div className="bg-white w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative h-[95vh] max-h-[800px]">


    {/* Image Section */}
    <div className="w-full lg:w-3/5 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center min-h-[200px] sm:min-h-[400px] lg:min-h-[700px] max-h-[800px]">
      {getImageUrl() ? (
        <img
          src={getImageUrl()}
          alt="Post content"
          className="object-contain w-full h-full max-h-[500px] lg:max-h-[700px] rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none"
        />
      ) : (
        <div className="text-white text-center opacity-60 p-6">
          <Icon icon="mdi:image-off" className="text-5xl sm:text-6xl mb-4 mx-auto opacity-40" />
          <p className="text-sm sm:text-base font-medium">No image available</p>
        </div>
      )}
    </div>

    {/* Info & Comments Section */}
    <div className="w-full lg:w-2/5 flex flex-col max-[380px]:h-[60vh] h-[50vh] sm:h-[60vh] lg:h-[95vh] max-h-[800px] bg-white">

      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.user.profilePic || '/default-pfp.png'}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-gray-100"
              alt="User avatar"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm lg:text-base text-gray-900">
              {post.user.name || post.user.username}
            </h3>
            <p className="text-xs lg:text-sm text-gray-500">@{post.user.username}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit / Save controls - only for owner */}
            {currentUserId === post.user._id && !isEditing && (
              <>
                <button onClick={handleStartEdit} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <Icon icon="ph:pencil-simple" className="text-gray-600 text-lg" />
                </button>
                <button onClick={handleDeletePost} className="p-2 hover:bg-red-50 rounded-full transition-colors">
                  <Icon icon="ph:trash" className="text-red-500 text-lg" />
                </button>
              </>
            )}
            {currentUserId === post.user._id && isEditing && (
              <div className="flex items-center gap-2">
                <button onClick={handleCancelEdit} disabled={isSavingEdit} className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={isSavingEdit} className="px-3 py-1 rounded bg-forest text-white text-xs font-semibold hover:opacity-90">
                  {isSavingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <Icon icon="ph:x-bold" className="text-gray-600 text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="p-4 lg:p-6 border-b border-gray-50 bg-gray-50/30">
        <div className="flex gap-3">
          <img
            src={post.user.profilePic || '/default-pfp.png'}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
            alt="User avatar"
          />
          <div className="flex-1">
            <span className="font-semibold text-sm text-gray-900 mr-2">
              {post.user.username}
            </span>
            {!isEditing ? (
              <span className="text-sm text-gray-700 leading-relaxed">
                {post.caption}
              </span>
            ) : (
              <div className="flex items-start gap-2">
                <input
                  value={editedCaption}
                  onChange={e => setEditedCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="flex-1 text-sm p-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
                  maxLength={500}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Tags Display */}
        {!isEditing ? (
          post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-forest/10 text-forest border border-forest/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )
        ) : (
          <div className="mt-3 space-y-3">
            {/* Current Tags */}
            {editedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-forest/10 text-forest border border-forest/20"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-forest/20 rounded-full p-0.5"
                    >
                      <Icon icon="material-symbols:close" className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Add New Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                className="flex-1 text-xs p-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
                maxLength={20}
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim() || editedTags.length >= 10}
                className="px-3 py-2 text-xs font-medium bg-forest text-white rounded hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            {/* Tag Limit Info */}
            <p className="text-xs text-gray-500">
              {editedTags.length}/10 tags • Press Enter to add
            </p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-6">
            <Icon icon="ph:chat-circle-dots" className="text-4xl text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 font-medium">No comments yet</p>
            <p className="text-xs text-gray-400">Be the first to comment!</p>
          </div>
        ) : (
          <div className="p-4 lg:p-6 space-y-6">
            {comments.map(comment => (
              <div key={comment._id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex gap-3 group">
                  <img
                    src={comment.user.profilePic || '/default-pfp.png'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
                    alt="Commenter avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => toggleCommentLike(comment._id)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors group"
                      >
                        <Icon
                          icon={comment.isLikedByUser ? 'ph:heart-fill' : 'ph:heart'}
                          className={`text-sm transition-all ${
                            comment.isLikedByUser 
                              ? 'text-red-500 scale-110' 
                              : 'text-gray-400 group-hover:text-red-500 group-hover:scale-110'
                          }`}
                        />
                        {(comment.likesCount ?? 0) > 0 && (
                          <span className="text-gray-600">{comment.likesCount}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {(comment.replies?.length ?? 0) > 0 && (
                  <div className="ml-11 space-y-3 border-l-2 border-gray-100 pl-4">
                    {(comment.replies ?? []).map(reply => (
                      <div key={reply._id} className="flex gap-3 group">
                        <img
                          src={reply.user.profilePic || '/default-pfp.png'}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
                          alt="Reply user avatar"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-gray-900 truncate">
                              {reply.user.username}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed mb-1">
                            {reply.content}
                          </p>
                          <button
                            onClick={() => toggleCommentLike(reply._id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors group"
                          >
                            <Icon
                              icon={reply.isLikedByUser ? 'ph:heart-fill' : 'ph:heart'}
                              className={`text-xs transition-all ${
                                reply.isLikedByUser 
                                  ? 'text-red-500 scale-110' 
                                  : 'text-gray-400 group-hover:text-red-500 group-hover:scale-110'
                              }`}
                            />
                            {(reply.likesCount ?? 0) > 0 && (
                              <span className="text-gray-600">{reply.likesCount}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment._id && (
                  <div className="ml-11 flex gap-0.5 bg-gray-50 p-3 rounded-lg border">
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.user.username}...`}
                      className="flex-1 p-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          handleReplySubmit(comment._id);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleReplySubmit(comment._id)}
                      className="px-3 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      disabled={!replyText.trim()}
                    >
                      Post
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions & Comment Input */}
      <div className="border-t border-gray-100 bg-white">
        {/* Action Buttons */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <button onClick={toggleLike} className="group transition-all duration-200 hover:scale-110">
              <Icon
                icon={isLiked ? 'ph:heart-fill' : 'ph:heart'}
                className={`text-2xl transition-all duration-200 ${
                  isLiked 
                    ? 'text-red-500 scale-110' 
                    : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
                }`}
              />
            </button>
            <button className="group transition-all duration-200 hover:scale-110">
              <Icon icon="ph:chat-circle" className="text-2xl text-gray-600 group-hover:text-blue-500 transition-colors" />
            </button>
      
          </div>
          <button onClick={toggleSave} className="group transition-all duration-200 hover:scale-110">
            <Icon
              icon={isSaved ? 'ph:bookmark-simple-fill' : 'ph:bookmark-simple'}
              className={`text-2xl transition-all duration-200 ${
                isSaved 
                  ? 'text-forest scale-110' 
                  : 'text-gray-600 group-hover:text-forest group-hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* Like Count */}
        {postLikeCount > 0 && (
          <div className="px-4 lg:px-6 pb-3">
            <p className="text-sm font-semibold text-gray-900">
              {postLikeCount.toLocaleString()} {postLikeCount === 1 ? 'like' : 'likes'}
            </p>
          </div>
        )}

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="p-4 lg:p-6 pt-0">
          <div className="flex gap-3 items-center bg-gray-50 rounded-full p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`px-4 py-1 rounded-full font-semibold text-sm transition-all duration-200 ${
                newComment.trim()
                  ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

  );
}