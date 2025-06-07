'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';

// Interfaces
interface User {
    _id: string;
    name: string;
    username: string;
    profilePic?: string;
}

interface Listing {
    _id: string;
    user: User;
    title: string;
    details: string;
    type: 'Single Room' | 'Whole Apartment' | 'Whole House';
    amenities: string[];
    city: string;
    country: string;
    roommates: string[];
    tags: string[];
    availability: string[];
    images: string[];
    thumbnail: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    commentsCount: number;
}

interface Comment {
    _id: string;
    user: User;
    text: string;
    likes: string[];  // Make sure this is always initialized as an array                
    createdAt: string;
    parentCommentId?: string;
    parentComment?: string | Comment;
    replies?: Comment[];
}

const ListingDetailPage: React.FC = () => {
    const params = useParams();
    const listingId = params?.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Set logged in user - only runs once
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const tempUserId = "mock-logged-in-user-id";
            setLoggedInUserId(tempUserId);
        }
    }, []);

    // Main data fetching useEffect
    useEffect(() => {
        if (!listingId) {
            setError('Listing ID is missing.');
            setLoading(false);
            return;
        }

        const fetchListingData = async () => {
            setLoading(true);
            try {
                const listingRes = await fetch(`${API_BASE_URL}/api/listing/${listingId}`);
                if (!listingRes.ok) {
                    if (listingRes.status === 404) {
                        throw new Error('Listing not found.');
                    }
                    const errorText = await listingRes.text();
                    throw new Error(`HTTP error! status: ${listingRes.status}, message: ${errorText}`);
                }
                const data: Listing = await listingRes.json();
                setListing(data);
                setMainImage(data.images[0] || data.thumbnail);

                const commentsRes = await fetch(`${API_BASE_URL}/api/comments/listing/${listingId}`);
                if (!commentsRes.ok) throw new Error('Failed to fetch comments');
                const flatComments: Comment[] = await commentsRes.json();
                const token = localStorage.getItem('token');
                 if (token && flatComments.length > 0) {
                    const commentLikeStatuses = await Promise.all(
                        flatComments.map(async (comment) => {
                            try {
                                const statusRes = await fetch(`${API_BASE_URL}/api/likes/status/comment/${comment._id}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (statusRes.ok) {
                                    const statusData = await statusRes.json();
                                    return { commentId: comment._id, isLiked: statusData.isLiked };
                                }
                            } catch (err) {
                                console.error('Error fetching comment like status:', err);
                            }
                            return { commentId: comment._id, isLiked: false };
                        })
                    );
                    
                    // Update comments with like status - this ensures proper initial state
                    const commentsWithInitialLikeState = flatComments.map(comment => {
                        const likeStatus = commentLikeStatuses.find(status => status.commentId === comment._id);
                        return {
                            ...comment,
                            likes: comment.likes || [], // Ensure likes is always an array
                            // You can add a isLikedByCurrentUser field if needed for UI optimization
                        };
                    });
                    
                    const nestedComments = buildNestedComments(commentsWithInitialLikeState);
                    setComments(nestedComments);
                } else {
                    const commentsWithLikes = flatComments.map(comment => ({
                        ...comment,
                        likes: comment.likes || []
                    }));
                    const nestedComments = buildNestedComments(commentsWithLikes);
                    setComments(nestedComments);
                }
                const nestedComments = buildNestedComments(flatComments);
                setComments(nestedComments);

                // Fetch like status if user is logged in (for listing)
                
                if (token) {
                    const likeStatusRes = await fetch(`${API_BASE_URL}/api/likes/status/${listingId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (likeStatusRes.ok) {
                        const statusData = await likeStatusRes.json();
                        setIsLiked(statusData.isLiked && statusData.itemType === 'listing');
                    }
                }
                  
                const likesCountRes = await fetch(`${API_BASE_URL}/api/likes/count/listing/${listingId}`);
                if (likesCountRes.ok) {
                    const countData = await likesCountRes.json();
                    setLikesCount(countData.count);
                }

                const commentsWithLikes = flatComments.map(comment => ({
                    ...comment,
                    likes: comment.likes || []
                }));


                setError(null);
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError(err instanceof Error ? err.message : 'Failed to load listing.');
            } finally {
                setLoading(false);
            }
        };

        fetchListingData();
    }, [listingId, API_BASE_URL]);

    const buildNestedComments = (comments: Comment[]): Comment[] => {
        // Check if comments are already nested (backend returns nested structure)
        if (comments.length > 0 && 'replies' in comments[0] && Array.isArray((comments[0] as any).replies)) {
            console.log('Comments already nested, returning as-is');
            return comments;
        }

        console.log('Building Instagram-style nested structure from flat array');

        // Create a map of all comments
        const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {};
        const topLevel: (Comment & { replies: Comment[] })[] = [];

        // First pass: create map of all comments with empty replies arrays
        comments.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] };
        });

        // Second pass: organize into hierarchy (only 2 levels)
        comments.forEach(comment => {
            const parentId = (comment as any).parentCommentId ||
                (typeof (comment as any).parentComment === 'string' ? (comment as any).parentComment :
                    (comment as any).parentComment?._id);

            if (parentId && commentMap[parentId]) {
                // This is a reply - add to parent's replies
                // For Instagram-style, all replies go to the main comment level
                let mainParent = commentMap[parentId];

                // If the parent is also a reply, find the main parent
                const parentParentId = (commentMap[parentId] as any).parentCommentId ||
                    (typeof (commentMap[parentId] as any).parentComment === 'string' ?
                        (commentMap[parentId] as any).parentComment :
                        (commentMap[parentId] as any).parentComment?._id);

                if (parentParentId && commentMap[parentParentId]) {
                    // Parent is a reply, so add this reply to the main parent
                    mainParent = commentMap[parentParentId];
                    // Add @username to the reply text if it's not already there
                    const replyingToUsername = commentMap[parentId].user.username;
                    if (!commentMap[comment._id].text.startsWith(`@${replyingToUsername}`)) {
                        commentMap[comment._id].text = `@${replyingToUsername} ${commentMap[comment._id].text}`;
                    }
                }

                mainParent.replies.push(commentMap[comment._id]);
            } else if (!parentId || parentId === null) {
                // This is a top-level comment
                topLevel.push(commentMap[comment._id]);
            }
        });

        // Sort replies by creation date (oldest first, like Instagram)
        topLevel.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
            }
        });

        return topLevel;
    };



    const handleLikeToggle = useCallback(async () => {
        if (!loggedInUserId) {
            alert('Please log in to like listings.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/listing/${listingId}`, {
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
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('An unexpected error occurred.');
        }
    }, [loggedInUserId, API_BASE_URL, listingId]);

    // Improved handleAddComment with proper nested comment handling
    const handleAddComment = useCallback(async (text: string, parentId: string | null = null) => {
        if (!loggedInUserId) {
            alert('Please log in to comment.');
            return;
        }
        if (!text.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/comments/listing/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: text.trim(),
                    parentCommentId: parentId,
                }),
            });

            if (res.ok) {
                const newComment: Comment = await res.json();

                if (parentId) {
                    // Add reply to the appropriate parent comment
                    setComments(prevComments =>
                        prevComments.map(c => {
                            if (c._id === parentId) {
                                // Direct reply to main comment
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), newComment]
                                };
                            } else if (c.replies && c.replies.some(reply => reply._id === parentId)) {
                                // Reply to a reply - add to main comment's replies
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), newComment]
                                };
                            }
                            return c;
                        })
                    );
                } else {
                    // Add new top-level comment
                    setComments(prev => [...prev, { ...newComment, replies: [] }]);
                }
            } else {
                const errorData = await res.json();
                alert(errorData.msg || 'Failed to add comment');
            }
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert('An unexpected error occurred.');
        }
    }, [loggedInUserId, API_BASE_URL, listingId]);

    const handleCommentLikeToggle = useCallback(async (commentId: string) => {
        if (!loggedInUserId) {
            alert('Please log in to like comments.');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/comment/${commentId}`, { // <-- New API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.ok) {
                const data = await res.json();

                // Update the comments state to reflect the like change
                setComments(prevComments => prevComments.map(comment => {
                    // Check if this is a main comment
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            likes: data.liked
                                ? [...(comment.likes || []), loggedInUserId]
                                : (comment.likes || []).filter(id => id !== loggedInUserId)
                        };
                    }

                    // Check if this is a reply within any main comment
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply._id === commentId
                                    ? {
                                        ...reply,
                                        likes: data.liked
                                            ? [...(reply.likes || []), loggedInUserId]
                                            : (reply.likes || []).filter(id => id !== loggedInUserId)
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
    }, [loggedInUserId, API_BASE_URL]);



    const formatAvailability = (dates: string[]) => {
        if (!dates || dates.length === 0) return 'Not specified';
        const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
        if (sortedDates.length === 1) {
            return `Available on: ${sortedDates[0].toLocaleDateString()}`;
        }
        return `Available: ${sortedDates[0].toLocaleDateString()} - ${sortedDates[sortedDates.length - 1].toLocaleDateString()}`;
    };

    // Improved CommentItem Component with proper nesting
    // Updated CommentItem Component with Instagram-style nesting
    const CommentItem: React.FC<{
        comment: Comment;
        isReply?: boolean;
    }> = ({ comment, isReply = false }) => {
        const [showReplyInput, setShowReplyInput] = useState(false);
        const [showMoreReplies, setShowMoreReplies] = useState(false);
        const [visibleRepliesCount, setVisibleRepliesCount] = useState(3);
        const replyInputRef = useRef<HTMLInputElement>(null);

        const handleReplySubmit = () => {
            const value = replyInputRef.current?.value.trim();
            if (value) {
                const finalText = isReply ? value : value;
                const parentId = isReply ? comment.parentCommentId || comment._id : comment._id;

                handleAddComment(finalText, parentId);
                if (replyInputRef.current) replyInputRef.current.value = '';
                setShowReplyInput(false);
            }
        };

        const handleReplyClick = () => {
            setShowReplyInput(true);
            setTimeout(() => {
                if (replyInputRef.current) {
                    const prefix = isReply ? `@${comment.user.username} ` : '';
                    replyInputRef.current.value = prefix;
                    replyInputRef.current.focus();
                    replyInputRef.current.setSelectionRange(prefix.length, prefix.length);
                }
            }, 0);
        };

        // Check if current user has liked this comment
        const isLikedByUser = comment.likes && comment.likes.includes(loggedInUserId || '');
        const likesCount = comment.likes ? comment.likes.length : 0;

        // Only show replies for main comments (not for replies)
        const repliesToShow = !isReply && comment.replies ?
            comment.replies.slice(0, visibleRepliesCount) : [];

        const hasMoreReplies = !isReply && comment.replies &&
            comment.replies.length > visibleRepliesCount;

        const hiddenRepliesCount = !isReply && comment.replies ?
            comment.replies.length - visibleRepliesCount : 0;

        const loadMoreReplies = () => {
            setVisibleRepliesCount(prev => prev + 6);
        };

        return (
            <div className={`${isReply ? 'ml-12' : 'mb-6'} ${!isReply ? 'border-b border-gray-100 pb-4' : 'mb-3'}`}>
                {/* Comment/Reply Content */}
                <div className="flex items-start space-x-3">
                    <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden flex-shrink-0`}>
                        {comment.user.profilePic ? (
                            <img
                                src={comment.user.profilePic}
                                alt={comment.user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <Icon icon="material-symbols:person-outline" className={`${isReply ? 'w-4 h-4' : 'w-6 h-6'} text-gray-600`} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-semibold text-gray-900 ${isReply ? 'text-sm' : 'text-base'}`}>
                                {comment.user.name}
                            </h4>
                            <span className={`text-gray-500 ${isReply ? 'text-xs' : 'text-sm'}`}>
                                @{comment.user.username}
                            </span>
                            <span className={`text-gray-400 ${isReply ? 'text-xs' : 'text-sm'}`}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className={`text-gray-700 mb-2 ${isReply ? 'text-sm' : 'text-base'}`}>
                            {comment.text}
                        </p>
                        <div className={`flex items-center space-x-4 ${isReply ? 'text-xs' : 'text-sm'}`}>
                            <button
                                onClick={() => handleCommentLikeToggle(comment._id)}
                                className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                                disabled={!loggedInUserId} // <-- Add this line
                            >
                                <Icon
                                    icon={isLikedByUser ? "material-symbols:favorite" : "material-symbols:favorite-outline"} // <-- Update icon logic
                                    className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} ${isLikedByUser ? 'text-red-500' : ''}`} // <-- Update class logic
                                />
                                <span>{likesCount}</span> {/* <-- Update likes count display */}
                            </button>
                            <button
                                onClick={handleReplyClick}
                                className="text-gray-500 hover:text-forest transition-colors font-medium"
                                disabled={!loggedInUserId}
                            >
                                Reply
                            </button>
                        </div>

                        {/* Reply Input */}
                        {showReplyInput && (
                            <div className="flex gap-2 mt-3">
                                <input
                                    ref={replyInputRef}
                                    className={`border border-gray-300 px-3 py-2 rounded-lg ${isReply ? 'text-xs' : 'text-sm'} flex-1 focus:ring-forest focus:border-forest`}
                                    placeholder="Write a reply..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleReplySubmit();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleReplySubmit}
                                    className={`${isReply ? 'text-xs' : 'text-sm'} bg-forest text-white px-3 py-2 rounded-lg hover:bg-teal-800 transition-colors`}
                                >
                                    Reply
                                </button>
                                <button
                                    onClick={() => setShowReplyInput(false)}
                                    className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-500 px-3 py-2 hover:text-gray-700 transition-colors`}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Replies Section - Only for main comments */}
                {!isReply && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4">
                        {/* Show More Replies Button - if there are hidden replies */}
                        {hasMoreReplies && (
                            <button
                                onClick={loadMoreReplies}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-3 ml-12"
                            >
                                ── View {Math.min(6, hiddenRepliesCount)} more {hiddenRepliesCount === 1 ? 'reply' : 'replies'}
                            </button>
                        )}

                        {/* Render visible replies */}
                        {repliesToShow.map(reply => (
                            <CommentItem key={reply._id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };


    // Updated CommentSection Component
    const CommentSection: React.FC<{
        comments: Comment[];
        handleAddComment: (text: string, parentId: string | null) => void;
    }> = ({ comments, handleAddComment }) => {
        const commentInputRef = useRef<HTMLInputElement>(null);

        const handleSubmit = () => {
            const val = commentInputRef.current?.value.trim();
            if (val) {
                handleAddComment(val, null);
                if (commentInputRef.current) commentInputRef.current.value = '';
            }
        };

        const totalCommentsCount = comments.length + comments.reduce((acc, comment) => acc + (comment.replies?.length || 0), 0);

        return (
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Comments ({totalCommentsCount})
                </h3>
                <div className="flex gap-2 mb-6">
                    <input
                        ref={commentInputRef}
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-forest focus:border-forest"
                        placeholder="Add a comment..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        className="bg-forest text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors"
                    >
                        Post
                    </button>
                </div>
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))
                )}
            </div>
        );
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-[10vh] bg-ambient text-forest">Loading listing details...</div>;
    }
    if (error) {
        return <div className="min-h-screen flex items-center justify-center pt-[10vh] bg-ambient text-red-600">Error: {error}</div>;
    }
    if (!listing) {
        return <div className="min-h-screen flex items-center justify-center pt-[10vh] bg-ambient text-gray-700">Listing not found.</div>;
    }

    return (
        <div className="min-h-screen pt-[10vh] bg-ambient text-forest font-inter pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Gallery Section */}
                <div className="mb-8">
                    {mainImage && (
                        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg mb-4">
                            <img
                                src={mainImage}
                                alt={listing?.title || 'Listing main image'}
                                className="w-full h-full object-cover"
                                width={1200}
                                height={500}
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {listing?.images.map((image, index) => (
                            <div
                                key={index}
                                className={`w-24 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${mainImage === image ? 'border-forest ring-2 ring-forest' : 'border-gray-200 hover:border-gray-400'}`}
                                onClick={() => setMainImage(image)}
                            >
                                <img
                                    src={image}
                                    alt={`Listing thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    width={96}
                                    height={96}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Listing Details and Host Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing?.title}</h1>
                        <p className="text-lg text-gray-700 mb-4 flex items-center">
                            <Icon icon="material-symbols:location-on-outline" className="w-5 h-5 mr-2 text-gray-600" />
                            {listing?.city}, {listing?.country}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 text-sm mb-6">
                            <span className="flex items-center">
                                <Icon icon="material-symbols:home-outline" className="w-5 h-5 mr-1" /> {listing?.type}
                            </span>
                            {listing?.roommates && listing.roommates.length > 0 && (
                                <span className="flex items-center">
                                    <Icon icon="material-symbols:group-outline" className="w-5 h-5 mr-1" /> Roommates: {listing?.roommates.join(', ')}
                                </span>
                            )}
                            <span className="flex items-center">
                                <Icon icon="material-symbols:calendar-today-outline" className="w-5 h-5 mr-1" /> {formatAvailability(listing?.availability)}
                            </span>
                        </div>

                        {/* Like and Comment counts */}
                        <div className="flex items-center gap-4 text-gray-700 mb-6">
                            <button onClick={handleLikeToggle} className="flex items-center space-x-1 focus:outline-none">
                                <Icon
                                    icon={isLiked ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                                    className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                                />
                                <span className="text-base font-medium">{likesCount} Likes</span>
                            </button>
                            <div className="flex items-center space-x-1">
                                <Icon icon="material-symbols:chat-bubble-outline" className="w-6 h-6 text-gray-500" />
                                <span className="text-base font-medium">{comments.length + comments.flatMap(c => c.replies || []).length} Comments</span>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-200" />

                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            {listing?.details}
                        </p>

                        {listing?.amenities && listing.amenities.length > 0 && (
                            <>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-3">What this place offers</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {listing?.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center text-gray-700">
                                            <Icon icon={`material-symbols:${amenity.replace(/-/g, '-')}`} className="w-6 h-6 mr-3 text-forest" />
                                            <span>{amenity.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {listing?.tags && listing.tags.length > 0 && (
                            <>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Tags/Features</h2>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {listing?.tags.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                            #{tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Comments Section */}
                        <hr className="my-6 border-gray-200" />
                        <CommentSection
                            comments={comments}
                            handleAddComment={handleAddComment}
                        />
                    </div>

                    {/* Host Card */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit sticky top-28">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Meet your Host</h2>
                        {listing?.user ? (
                            <Link href={`/profile/${listing?.user._id}`} passHref>
                                <div className="flex items-center mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-forest">
                                        {listing?.user.profilePic ? (
                                            <img
                                                src={listing?.user.profilePic}
                                                alt={listing?.user.name}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Icon icon="material-symbols:person-outline" className="w-16 h-16 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{listing?.user.name}</h3>
                                        <p className="text-gray-600 text-sm">@{listing?.user.username}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <p className="text-gray-600">Host information not available.</p>
                        )}

                        <p className="text-gray-700 text-sm mb-4">
                            {listing?.user?.name} is a verified host on Casway, committed to providing great stays.
                        </p>
                        <button
                            onClick={() => { /* Implement chat functionality */ }}
                            className="w-full bg-forest text-white px-6 py-3 rounded-full font-medium hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Icon icon="material-symbols:chat-outline" className="w-5 h-5" />
                            Message Host
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailPage;