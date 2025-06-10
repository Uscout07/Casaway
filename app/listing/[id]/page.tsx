// app/listing/[id]/page.tsx
'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Import components
import ListingDetailSkeleton from '../listingDetailsSkeleton';
import ListingGallery from '../postGallery';
import ListingDetailsCard from '../listingCard';
import ProfileHeader from '../profileHeader';
import CommentSection from '../commentSection';

// Import interfaces
import { User, Listing, Comment } from '../listingPageTypes'; // Adjust path if needed


const ListingDetailPage: React.FC = () => {
    const params = useParams();
    const listingId = params?.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>([]);

    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real application, you'd decode the token to get the actual user ID
            // For now, using a mock ID as in your original code
            const tempUserId = "mock-logged-in-user-id";
            setLoggedInUserId(tempUserId);
        }
    }, []);

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

    // FETCH COMMENTS + LIKE STATUS + LIKE COUNT + NEST
    useEffect(() => {
        if (!listingId) return;
        const token = localStorage.getItem('token') || '';

        (async () => {
            try {
                const flatRes = await fetch(`${API_BASE_URL}/api/comments/listing/${listingId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!flatRes.ok) throw new Error('Failed to fetch comments');
                const flatComments: Comment[] = await flatRes.json();

                const flatWithStats = await Promise.all(
                    flatComments.map(async (c) => {
                        const [statusRes, countRes] = await Promise.all([
                            fetch(`${API_BASE_URL}/api/likes/status/comment/${c._id}`, {
                                headers: token ? { Authorization: `Bearer ${token}` } : {}
                            }).then(r => r.json()).catch(() => ({ isLiked: false })),
                            fetch(`${API_BASE_URL}/api/likes/count/comment/${c._id}`)
                                .then(r => r.json()).catch(() => ({ count: 0 })),
                        ]);
                        return {
                            ...c,
                            isLikedByUser: statusRes.isLiked,
                            likesCount: countRes.count,
                        };
                    })
                );

                const nested = buildNestedComments(flatWithStats);
                setComments(nested);
            } catch (err) {
                console.error('Error fetching comments:', err);
            }
        })();
    }, [listingId, API_BASE_URL]);

    // FETCH LISTING LIKE STATUS + COUNT
    useEffect(() => {
        if (!listingId) return;
        const token = localStorage.getItem('token') || '';

        (async () => {
            try {
                const [statusRes, countRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/likes/status/${listingId}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }).then(r => r.json()).catch(() => ({ isLiked: false })),
                    fetch(`${API_BASE_URL}/api/likes/count/listing/${listingId}`)
                        .then(r => r.json()).catch(() => ({ count: 0 })),
                ]);
                setIsLiked(statusRes.isLiked && statusRes.itemType === 'listing');
                setLikesCount(countRes.count);
            } catch (err) {
                console.error('Error fetching listing likes:', err);
            }
        })();
    }, [listingId, API_BASE_URL]);

    const buildNestedComments = (flatComments: Comment[]): Comment[] => {
        if (flatComments.length > 0 && 'replies' in flatComments[0] && Array.isArray((flatComments[0] as any).replies)) {
            console.log('Comments already nested, returning as-is');
            return flatComments;
        }

        console.log('Building Instagram-style nested structure from flat array');

        const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {};
        const topLevel: (Comment & { replies: Comment[] })[] = [];

        flatComments.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] };
        });

        flatComments.forEach(comment => {
            const parentId = (comment as any).parentCommentId ||
                (typeof (comment as any).parentComment === 'string' ? (comment as any).parentComment :
                    (comment as any).parentComment?._id);

            if (parentId && commentMap[parentId]) {
                let mainParent = commentMap[parentId];

                const parentParentId = (commentMap[parentId] as any).parentCommentId ||
                    (typeof (commentMap[parentId] as any).parentComment === 'string' ?
                        (commentMap[parentId] as any).parentComment :
                        (commentMap[parentId] as any).parentComment?._id);

                if (parentParentId && commentMap[parentParentId]) {
                    mainParent = commentMap[parentParentId];
                    const replyingToUsername = commentMap[parentId].user.username;
                    if (!commentMap[comment._id].text.startsWith(`@${replyingToUsername}`)) {
                        commentMap[comment._id].text = `@${replyingToUsername} ${commentMap[comment._id].text}`;
                    }
                }
                mainParent.replies.push(commentMap[comment._id]);
            } else if (!parentId || parentId === null) {
                topLevel.push(commentMap[comment._id]);
            }
        });

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
                const enrichedComment = {
                    ...newComment,
                    isLikedByUser: false,
                    likesCount: 0
                };

                if (parentId) {
                    setComments(prevComments =>
                        prevComments.map(c => {
                            if (c._id === parentId) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), enrichedComment]
                                };
                            } else if (c.replies && c.replies.some(reply => reply._id === parentId)) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), enrichedComment]
                                };
                            }
                            return c;
                        })
                    );
                } else {
                    setComments(prev => [...prev, { ...enrichedComment, replies: [] }]);
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
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/comment/${commentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (res.ok) {
                const data = await res.json();

                setComments(prevComments => prevComments.map(comment => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            isLikedByUser: data.liked,
                            likesCount: data.likesCount || (data.liked ? (comment.likesCount || 0) + 1 : (comment.likesCount || 0) - 1)
                        };
                    }

                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply._id === commentId
                                    ? {
                                        ...reply,
                                        isLikedByUser: data.liked,
                                        likesCount: data.likesCount || (data.liked ? (reply.likesCount || 0) + 1 : (reply.likesCount || 0) - 1)
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

    if (loading) {
        return <ListingDetailSkeleton />;
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
                <ListingGallery
                    images={listing.images}
                    mainImage={mainImage}
                    setMainImage={setMainImage}
                    title={listing.title}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <ListingDetailsCard
                        listing={listing}
                        isLiked={isLiked}
                        likesCount={likesCount}
                        comments={comments}
                        handleLikeToggle={handleLikeToggle}
                        formatAvailability={formatAvailability}
                    />

                    {listing.user && <ProfileHeader user={listing.user} />}
                </div>

                <hr className="my-6 border-gray-200" />
                <CommentSection
                    comments={comments}
                    handleAddComment={handleAddComment}
                    handleCommentLikeToggle={handleCommentLikeToggle}
                    loggedInUserId={loggedInUserId}
                />
            </div>
        </div>
    );
};

export default ListingDetailPage;