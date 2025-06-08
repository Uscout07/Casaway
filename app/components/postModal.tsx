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
  // Added for comment likes
  isLikedByUser?: boolean; // To store if the current user liked this comment
  likesCount?: number;     // To store the total likes for this comment
}

interface Post {
  _id: string;
  user: User;
  image?: string;
  imageUrl?: string;
  caption?: string;
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
  const [postLikeCount, setPostLikeCount] = useState(0); // Renamed for clarity
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get the correct image URL
  const getImageUrl = () => {
    return post.image || post.imageUrl || '';
  };

  // Load like, save status, comments, and like count when modal opens
  useEffect(() => {
    if (!modalOpen) return;

    const fetchEverything = async () => {
      setLoading(true);
      try {
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

        // --- Fetch comment like status and count for each comment ---
        const commentsWithLikes = await Promise.all(
          fetchedComments.map(async (comment) => {
            const [likeStatusRes, likeCountRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/api/likes/status/comment/${comment._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => ({ data: { isLiked: false } })),
              axios.get(`${API_BASE_URL}/api/likes/count/comment/${comment._id}`).catch(() => ({ data: { count: 0 } })),
            ]);

            // Recursively fetch replies' like statuses
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
        // -----------------------------------------------------------

      } catch (err) {
        console.error('Error loading post details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [modalOpen, post._id, token, API_BASE_URL]);

  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/likes/toggle/post/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);
      // Update like count based on the action
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
          // Check if it's the main comment being liked
          if (comment._id === commentId) {
            return {
              ...comment,
              isLikedByUser: res.data.liked,
              likesCount: res.data.likesCount, // Backend should return updated count
            };
          }
          // Check if it's a reply being liked
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

      // Fetch like status and count for the newly added comment
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
        ...prev, // Consider adding new comments to the top if that's desired
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

      // Fetch like status and count for the newly added reply
      const [likeStatusRes, likeCountRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/likes/status/comment/${res.data._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { isLiked: false } })),
        axios.get(`${API_BASE_URL}/api/likes/count/comment/${res.data._id}`).catch(() => ({ data: { count: 0 } })),
      ]);

      // Add reply to the parent comment
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
    <div className="fixed inset-0 z-50 bg-forest/70 flex justify-center items-center p-4">
      <div className="bg-ambient w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden shadow-xl flex flex-col md:flex-row relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-forest/20 hover:bg-forest/40 rounded-full p-2 transition-colors"
        >
          <Icon icon="ph:x-bold" className="text-white text-xl" />
        </button>

        {/* Image Section */}
        <div className="md:w-2/3 bg-forest-light flex items-center justify-center min-h-[300px] md:min-h-[600px]">
          {getImageUrl() ? (
            <img
              src={getImageUrl()}
              alt="post"
              className="object-contain w-full h-full max-h-[600px]"
            />
          ) : (
            <div className="text-white text-center">
              <Icon icon="mdi:image-off" className="text-6xl mb-2" />
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Info & Comments Section */}
        <div className="md:w-1/3 flex flex-col h-[400px] md:h-[600px]">

          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={post.user.profilePic || '/default-pfp.png'}
                className="w-10 h-10 rounded-full object-cover"
                alt="user"
              />
              <div>
                <span className="font-semibold text-sm">{post.user.name || post.user.username}</span>
                <p className="text-xs text-gray-500">@{post.user.username}</p>
              </div>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-3">
                <img
                  src={post.user.profilePic || '/default-pfp.png'}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  alt="user"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm mr-2">{post.user.username}</span>
                  <span className="text-sm">{post.caption}</span>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <Icon icon="eos-icons:loading" className="text-2xl text-gray-500" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center">No comments yet.</p>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="space-y-2">
                  {/* Main Comment */}
                  <div className="flex gap-3">
                    <img
                      src={comment.user.profilePic || '/default-pfp.png'}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt="user"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.user.username}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReplyingTo(comment._id)}
                          className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                        >
                          Reply
                        </button>
                        {/* Comment Like Button */}
                        <button
                          onClick={() => toggleCommentLike(comment._id)}
                          className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
                        >
                          <Icon
                            icon={comment.isLikedByUser ? 'mdi:heart' : 'mdi:heart-outline'}
                            className={`text-base ${comment.isLikedByUser ? 'text-red-500' : 'text-gray-600'}`}
                          />
                          {(comment.likesCount ?? 0) > 0 && <span>{comment.likesCount ?? 0}</span>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="flex gap-3">
                          <img
                            src={reply.user.profilePic || '/default-pfp.png'}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            alt="user"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">{reply.user.username}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                            {/* Reply Like Button */}
                            <button
                              onClick={() => toggleCommentLike(reply._id)}
                              className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1"
                            >
                              <Icon
                                icon={reply.isLikedByUser ? 'mdi:heart' : 'mdi:heart-outline'}
                                className={`text-sm ${reply.isLikedByUser ? 'text-red-500' : 'text-gray-600'}`}
                              />
                              {(reply.likesCount ?? 0) > 0 && <span>{reply.likesCount ?? 0}</span>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === comment._id && (
                    <div className="ml-11 flex gap-2">
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.user.username}...`}
                        className="flex-1 p-2 text-xs rounded border border-gray-300 bg-white"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            handleReplySubmit(comment._id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleReplySubmit(comment._id)}
                        className="text-blue-500 text-xs font-semibold"
                      >
                        Post
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="text-gray-500 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Actions & Comment Input */}
          <div className="border-t border-gray-200  p-4 space-y-3">

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={toggleLike} className="hover:scale-110 transition-transform">
                  <Icon
                    icon={isLiked ? 'mdi:heart' : 'mdi:heart-outline'}
                    className={`text-2xl ${isLiked ? 'text-red-500' : 'text-gray-600 '}`}
                  />
                </button>
                <button className="hover:scale-110 transition-transform">
                  <Icon icon="mdi:comment-outline" className="text-2xl text-gray-600 " />
                </button>
              </div>
              <button onClick={toggleSave} className="hover:scale-110 transition-transform">
                <Icon
                  icon={isSaved ? 'mdi:bookmark' : 'mdi:bookmark-outline'}
                  className={`text-2xl ${isSaved ? 'text-forest' : 'text-gray-600 '}`}
                />
              </button>
            </div>

            {/* Like Count */}
            {postLikeCount > 0 && (
              <p className="text-sm font-semibold">
                {postLikeCount} {postLikeCount === 1 ? 'like' : 'likes'}
              </p>
            )}

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 text-sm border-none outline-none bg-transparent placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`font-semibold text-sm ${
                  newComment.trim()
                    ? 'text-blue-500 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}