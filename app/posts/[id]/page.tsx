// app/posts/[id]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import Image from 'next/image'; // For optimized images
import Link from 'next/link';

// (Re-use your Post, Comment interfaces here)
interface User {
    _id: string;
    name: string;
    username: string;
    profilePic?: string;
}

interface Post {
    _id: string;
    user: User; // Populated user
    caption: string;
    tags: string[];
    city: string;
    country: string;
    imageUrl: string;
    images: string[];
    createdAt: string;
    likesCount: number; // Will be fetched/derived
    commentsCount: number; // Will be fetched/derived
}

interface Comment {
    _id: string;
    user: User; // Populated user
    text: string;
    likes: string[]; // User IDs who liked the comment
    createdAt: string;
    replies?: Comment[]; // For nested comments
}

const PostDetailPage: React.FC = () => {
    const params = useParams();
    const postId = params?.id as string;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false); // For saving posts

    useEffect(() => {
        const token = localStorage.getItem('token');
        // You'll need an endpoint to get the logged-in user's ID
        // For now, let's mock it or assume you have a way to get it
        // A simple way is to decode the token on the client side if it's JWT, or fetch /users/me
        // For this example, let's assume you fetch it from localStorage or context
        if (token) {
            // In a real app, you'd verify/decode the token or fetch /api/users/me
            // For now, a placeholder:
            const tempUserId = "mock-logged-in-user-id"; // Replace with actual logic
            setLoggedInUserId(tempUserId);
        }
    }, []);


    // Fetch post, likes, comments, saved status
    useEffect(() => {
        if (!postId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Post
                const postRes = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
                if (!postRes.ok) throw new Error('Failed to fetch post');
                const postData: Post = await postRes.json();
                setPost(postData);

                // Fetch Comments
                const commentsRes = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`);
                if (!commentsRes.ok) throw new Error('Failed to fetch comments');
                const commentsData: Comment[] = await commentsRes.json();
                setComments(commentsData);

                // Fetch Like Status & Count
                const likeStatusRes = await fetch(`${API_BASE_URL}/api/likes/status/${postId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (likeStatusRes.ok) {
                    const statusData = await likeStatusRes.json();
                    setIsLiked(statusData.isLiked && statusData.itemType === 'post');
                }

                const likesCountRes = await fetch(`${API_BASE_URL}/api/likes/count/post/${postId}`);
                if (likesCountRes.ok) {
                    const countData = await likesCountRes.json();
                    setLikesCount(countData.count);
                }

                // Fetch Saved Status (for posts only)
                const savedStatusRes = await fetch(`${API_BASE_URL}/api/saved-posts/status/${postId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (savedStatusRes.ok) {
                    const savedData = await savedStatusRes.json();
                    setIsSaved(savedData.isSaved);
                }


            } catch (err: any) {
                setError(err.message || 'Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId, API_BASE_URL, loggedInUserId]); // Re-fetch if loggedInUserId changes

    const handleLikeToggle = async () => {
        if (!loggedInUserId) {
            alert('Please log in to like posts.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/post/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
                setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
            } else {
                // Handle error (e.g., token expired, already liked)
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('An unexpected error occurred.');
        }
    };

    const handleSaveToggle = async () => {
        if (!loggedInUserId) {
            alert('Please log in to save posts.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/saved-posts/toggle/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.saved);
                alert(data.msg);
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to toggle save status');
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            alert('An unexpected error occurred.');
        }
    };

    const handleAddComment = async (parentId: string | null = null) => {
        if (!loggedInUserId) {
            alert('Please log in to comment.');
            return;
        }
        if (!newCommentText.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/comments/post/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: newCommentText, parentCommentId: parentId }),
            });
            if (res.ok) {
                const newComment: Comment = await res.json();
                // Find the parent comment if it's a reply and add the reply
                if (parentId) {
                    setComments(prevComments => prevComments.map(c =>
                        c._id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c
                    ));
                } else {
                    setComments(prevComments => [...prevComments, newComment]);
                }
                setNewCommentText(''); // Clear input
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('An unexpected error occurred.');
        }
    };

    const handleCommentLikeToggle = async (commentId: string) => {
        if (!loggedInUserId) {
            alert('Please log in to like comments.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/comments/toggle-like/${commentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (res.ok) {
                const data = await res.json();
                // Update the specific comment's likes in state
                setComments(prevComments => prevComments.map(comment => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            likes: data.liked
                                ? [...comment.likes, loggedInUserId]
                                : comment.likes.filter(id => id !== loggedInUserId)
                        };
                    }
                    // Also check replies
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply._id === commentId
                                    ? {
                                        ...reply,
                                        likes: data.liked
                                            ? [...reply.likes, loggedInUserId]
                                            : reply.likes.filter(id => id !== loggedInUserId)
                                    }
                                    : reply
                            )
                        };
                    }
                    return comment;
                }));
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to toggle comment like');
            }
        } catch (error) {
            console.error('Error toggling comment like:', error);
            alert('An unexpected error occurred.');
        }
    };

    const CommentSection: React.FC<{ comments: Comment[]; loggedInUserId: string | null }> = ({ comments, loggedInUserId }) => {
        const [replyingTo, setReplyingTo] = useState<string | null>(null);
        const [replyText, setReplyText] = useState('');

        const handleReplySubmit = async (commentId: string) => {
            if (!replyText.trim()) return;
            await handleAddComment(commentId);
            setReplyText('');
            setReplyingTo(null);
        };

        const renderComment = (comment: Comment) => (
            <div key={comment._id} className="mb-4">
                <div className="flex items-start gap-3">
                    <Link href={`/profile/${comment.user._id}`}>
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 cursor-pointer">
                            {comment.user?.profilePic ? (
                                <Image src={comment.user.profilePic} alt={comment.user.username || comment.user.name} width={36} height={36} className="object-cover" />
                            ) : (
                                <Icon icon="material-symbols:person-outline" className="w-9 h-9 text-gray-400" />
                            )}
                        </div>
                    </Link>
                    <div className="flex-1">
                        <p className="text-sm">
                            <Link href={`/profile/${comment.user._id}`} className="font-semibold text-gray-800 hover:underline">
                                {comment.user?.username || comment.user?.name}
                            </Link>{' '}
                            {comment.text}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                            <button
                                onClick={() => handleCommentLikeToggle(comment._id)}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                                <Icon icon={comment.likes.includes(loggedInUserId || '') ? "material-symbols:favorite" : "material-symbols:favorite-outline"} className={`w-4 h-4 ${comment.likes.includes(loggedInUserId || '') ? 'text-red-500' : 'text-gray-500'}`} />
                                {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
                            </button>
                            <button onClick={() => setReplyingTo(comment._id)} className="hover:underline">Reply</button>
                        </div>

                        {replyingTo === comment._id && (
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Replying to ${comment.user?.username || comment.user?.name}...`}
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-forest focus:border-forest"
                                />
                                <button
                                    onClick={() => handleReplySubmit(comment._id)}
                                    className="bg-forest text-white px-3 py-2 rounded-lg text-sm hover:bg-teal-800 transition-colors"
                                >
                                    Post
                                </button>
                                <button
                                    onClick={() => {setReplyingTo(null); setReplyText('');}}
                                    className="text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 mt-3 border-l-2 border-gray-200 pl-4">
                                {comment.replies.map(renderComment)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

        return (
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments ({comments.length + comments.flatMap(c => c.replies || []).length})</h3>
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-forest focus:border-forest"
                        />
                        <button
                            onClick={() => handleAddComment()}
                            className="bg-forest text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors"
                        >
                            Post
                        </button>
                    </div>
                </div>
                <div>
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map(renderComment)
                    )}
                </div>
            </div>
        );
    };


    if (loading) return (
      <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Icon icon="eos-icons:loading" className="w-16 h-16 text-forest mx-auto mb-4" />
          <p className="text-xl font-medium">Loading Post...</p>
        </div>
      </div>
    );
    if (error) return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <Icon icon="material-symbols:error-outline" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-gray-700 mb-4">{error}</p>
            </div>
        </div>
    );
    if (!post) return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <Icon icon="material-symbols:sentiment-dissatisfied-outline" className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
                <p className="text-gray-700 mb-4">The post you are looking for does not exist.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter pb-12">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg my-8">
                {/* Post Header (User Info) */}
                <div className="flex items-center p-4 border-b border-gray-100">
                    <Link href={`/profile/${post.user._id}`}>
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 cursor-pointer">
                            {post.user?.profilePic ? (
                                <Image src={post.user.profilePic} alt={post.user.username || post.user.name} width={40} height={40} className="object-cover" />
                            ) : (
                                <Icon icon="material-symbols:person-outline" className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                    </Link>
                    <div>
                        <Link href={`/profile/${post.user._id}`} className="font-semibold text-gray-900 hover:underline">
                            {post.user.username || post.user.name}
                        </Link>
                        <p className="text-xs text-gray-500">{post.city}{post.city && post.country ? ', ' : ''}{post.country}</p>
                    </div>
                    {/* More options icon could go here */}
                </div>

                {/* Post Image */}
                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image
                        src={post.imageUrl || post.images[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'}
                        alt={post.caption}
                        fill
                        style={{ objectFit: 'contain' }} // Use contain for Instagram style
                        className="object-center"
                    />
                </div>

                {/* Post Actions (Like, Comment, Share, Save) */}
                <div className="flex items-center justify-between p-4 text-gray-700 border-b border-gray-100">
                    <div className="flex space-x-4">
                        <button onClick={handleLikeToggle} className="flex items-center space-x-1 focus:outline-none">
                            <Icon
                                icon={isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                                className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                            />
                            <span className="text-sm font-medium">{likesCount}</span>
                        </button>
                        <button className="flex items-center space-x-1 focus:outline-none" onClick={() => document.getElementById('commentInput')?.focus()}>
                            <Icon icon="material-symbols:chat-bubble-outline" className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                            <span className="text-sm font-medium">{comments.length + comments.flatMap(c => c.replies || []).length}</span> {/* Total comments count */}
                        </button>
                        {/* Share icon */}
                        <button className="focus:outline-none">
                            <Icon icon="material-symbols:send-outline" className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                        </button>
                    </div>
                    <div>
                        <button onClick={handleSaveToggle} className="focus:outline-none">
                            <Icon
                                icon={isSaved ? "material-symbols:bookmark" : "material-symbols:bookmark-outline"}
                                className={`w-7 h-7 transition-colors ${isSaved ? 'text-blue-500' : 'text-gray-500 hover:text-blue-400'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Post Caption and Tags */}
                <div className="p-4">
                    <p className="text-sm mb-2">
                        <Link href={`/profile/${post.user._id}`} className="font-semibold text-gray-900 hover:underline">
                            {post.user.username || post.user.name}
                        </Link>{' '}
                        {post.caption}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                            {post.tags.map((tag, index) => (
                                <span key={index} className="hover:underline cursor-pointer">#{tag}</span>
                            ))}
                        </div>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                        {new Date(post.createdAt).toLocaleString()}
                    </p>
                </div>

                {/* Comments Section */}
                <div className="p-4 pt-0">
                    <CommentSection comments={comments} loggedInUserId={loggedInUserId} />
                </div>
            </div>
        </div>
    );
};

export default PostDetailPage;