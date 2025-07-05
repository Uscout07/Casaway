'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
// import DatePicker from 'react-datepicker'; // Removed DatePicker
// import 'react-datepicker/dist/react-datepicker.css'; // Removed datepicker styles

import ListingDetailSkeleton from '../listingDetailsSkeleton';
import ListingGallery from '../postGallery';
import ListingDetailsCard from '../listingDetailsCard'; // Ensure this import is correct
import { Icon } from '@iconify/react';
import ProfileHeader from '../HostCard';
import CommentSection from '../commentSection';

import { User, Listing, Comment } from '../listingPageTypes';

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    city?: string;
    country?: string;
    profilePic?: string;
}

const ListingDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter(); // Initialize useRouter
    const listingId = params?.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mainImage, setMainImage] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null); // State to store logged-in user details
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // Removed startDate and endDate states from here, as they are now managed in ListingDetailsCard
    // const [startDate, setStartDate] = useState<Date | null>(null);
    // const [endDate, setEndDate] = useState<Date | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // ✅ Recursively enrich comment + replies with like data
    const enrichCommentLikes = async (comment: any): Promise<any> => {
        const token = localStorage.getItem('token') || '';
        const [statusRes, countRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/likes/status/comment/${comment._id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            }).then(r => r.json()).catch(() => ({ isLiked: false })),
            fetch(`${API_BASE_URL}/api/likes/count/comment/${comment._id}`)
                .then(r => r.json()).catch(() => ({ count: 0 }))
        ]);

        const enrichedReplies = comment.replies?.length
            ? await Promise.all(comment.replies.map(enrichCommentLikes))
            : [];

        return {
            ...comment,
            isLikedByUser: statusRes.isLiked,
            likesCount: countRes.count,
            replies: enrichedReplies
        };
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    const userObj: UserProfile = JSON.parse(userString);
                    setLoggedInUserId(userObj._id);
                    setLoggedInUser(userObj);
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                }
            } else {
                setLoggedInUserId('mock-logged-in-user-id');
                setLoggedInUser({ _id: 'mock-logged-in-user-id', name: 'Guest User', email: 'guest@example.com', city: 'Unknown', country: 'Unknown' });
            }
        }
    }, []);

    // ✅ Listing Fetch
    useEffect(() => {
        if (!listingId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/listing/${listingId}`);
                if (!res.ok) throw new Error('Listing not found');
                const data: Listing = await res.json();
                setListing(data);
                setMainImage(data.images[0] || data.thumbnail);
            } catch (err: any) {
                setError(err.message || 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        })();
    }, [listingId]);

    // ✅ Listing Like Status
    useEffect(() => {
        if (!listingId) return;
        const token = localStorage.getItem('token') || '';
        (async () => {
            try {
                const [statusRes, countRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/likes/status/${listingId}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }).then(r => r.json()).catch(() => ({ liked: false })),
                    fetch(`${API_BASE_URL}/api/likes/count/listing/${listingId}`)
                        .then(r => r.json()).catch(() => ({ count: 0 }))
                ]);
                setIsLiked(statusRes.liked ?? statusRes.isLiked ?? false);
                setLikesCount(countRes.count);
            } catch (err) {
                console.error('Error fetching listing likes:', err);
            }
        })();
    }, [listingId]);

    // ✅ Recursive Comment Fetch + Like Enrich
    useEffect(() => {
        if (!listingId) return;
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/comments/listing/${listingId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
                });
                if (!res.ok) throw new Error('Comment fetch failed');
                const flatComments = await res.json();

                const enriched = await Promise.all(flatComments.map(enrichCommentLikes));
                const alreadyNested = enriched.some(c => Array.isArray((c as any).replies));
                setComments(alreadyNested ? enriched : buildNestedComments(enriched));
            } catch (err) {
                console.error('Error fetching comments:', err);
            }
        })();
    }, [listingId]);

    // 🧠 Manual nesting (fallback if backend is flat)
    const buildNestedComments = (flatComments: Comment[]): Comment[] => {
        const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {};
        const topLevel: (Comment & { replies: Comment[] })[] = [];

        flatComments.forEach(comment => {
            commentMap[comment._id] = { ...comment, replies: [] };
        });

        flatComments.forEach(comment => {
            const parentId =
                comment.parentCommentId ||
                (typeof comment.parentComment === 'string'
                    ? comment.parentComment
                    : comment.parentComment?._id);

            if (parentId && commentMap[parentId]) {
                commentMap[parentId].replies.push(commentMap[comment._id]);
            } else {
                topLevel.push(commentMap[comment._id]);
            }
        });

        return topLevel;
    };

    const handleLikeToggle = useCallback(async () => {
        if (!loggedInUserId) return alert('Please log in');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/listing/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setIsLiked(data.liked);
                setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
            } else {
                alert(data.msg || 'Failed to toggle like');
            }
        } catch (error) {
            console.error('Like toggle error:', error);
        }
    }, [loggedInUserId, listingId]);

    const handleAddComment = useCallback(async (text: string, parentId: string | null = null) => {
        if (!loggedInUserId) return alert('Please log in');
        if (!text.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/comments/listing/${listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: text.trim(), parentCommentId: parentId })
            });

            if (res.ok) {
                const newComment: Comment = await res.json();
                const enriched = { ...newComment, isLikedByUser: false, likesCount: 0 };
                if (parentId) {
                    setComments(prev =>
                        prev.map(c =>
                            c._id === parentId
                                ? { ...c, replies: [...(c.replies || []), enriched] }
                                : {
                                    ...c,
                                    replies: c.replies?.map(r =>
                                        r._id === parentId
                                            ? { ...r, replies: [...(r.replies || []), enriched] }
                                            : r
                                    )
                                }
                        )
                    );
                } else {
                    setComments(prev => [...prev, { ...enriched, replies: [] }]);
                }
            } else {
                const errData = await res.json();
                alert(errData.msg || 'Failed to comment');
            }
        } catch (err) {
            console.error('Add comment failed:', err);
        }
    }, [loggedInUserId, listingId]);

    const handleCommentLikeToggle = useCallback(async (commentId: string) => {
        if (!loggedInUserId) return alert('Please log in');
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE_URL}/api/likes/toggle/comment/${commentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();

            const updateRecursive = (comments: Comment[]): Comment[] =>
                comments.map(comment => {
                    if (comment._id === commentId) {
                        return {
                            ...comment,
                            isLikedByUser: data.liked,
                            likesCount: data.likesCount ?? (data.liked
                                ? (comment.likesCount || 0) + 1
                                : (comment.likesCount || 0) - 1)
                        };
                    }
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: updateRecursive(comment.replies)
                        };
                    }
                    return comment;
                });

            setComments(prev => updateRecursive(prev));
        } catch (err) {
            console.error('Comment like toggle failed:', err);
        }
    }, [loggedInUserId, listingId]);

    // Modified handleContactHost to accept startDate and endDate as string parameters
    const handleContactHost = async (startDateStr: string | null, endDateStr: string | null) => {
        if (!loggedInUser) {
            alert('Please log in to contact the host.');
            router.push('/auth');
            return;
        }

        if (!startDateStr || !endDateStr) {
            alert('Please select a date range.');
            return;
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (!listing?.user?._id) {
            alert('Host information not available.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication token missing. Please log in.');
            router.push('/auth');
            return;
        }

        try {
            // 1. Create or Get Chat with Host
            const chatRes = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId: listing.user._id })
            });

            if (!chatRes.ok) {
                const errorData = await chatRes.json();
                throw new Error(errorData.msg || 'Failed to create or get chat.');
            }
            const chatData = await chatRes.json();
            const chatId = chatData._id;

            // 2. Construct Automated Message
            const formattedStartDate = startDate.toLocaleDateString();
            const formattedEndDate = endDate.toLocaleDateString();
            const messageContent = `Hi, I am ${loggedInUser.name}${loggedInUser.city && loggedInUser.country ? ` from ${loggedInUser.city}, ${loggedInUser.country}` : ''}. Is your listing "${listing.title}" available from ${formattedStartDate} to ${formattedEndDate}?`;

            // 3. Send Automated Message
            const messageRes = await fetch(`${API_BASE_URL}/api/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ chatId, content: messageContent })
            });

            if (!messageRes.ok) {
                const errorData = await messageRes.json();
                throw new Error(errorData.msg || 'Failed to send automated message.');
            }

            alert('Message sent to host! Redirecting to chat...');
            router.push(`/messages/${chatId}`); // Redirect to the chat page
        } catch (err: any) {
            console.error('Error contacting host:', err);
            alert(`Error contacting host: ${err.message || 'An unknown error occurred.'}`);
        }
    };

    // This function will format the availability dates for display in ListingDetailsCard
    const formatAvailability = (dates: string[]): string => {
        if (!dates || dates.length === 0) {
            return 'Not specified';
        }
        const sorted = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
        if (sorted.length === 1) {
            return `Available on: ${sorted[0].toLocaleDateString()}`;
        }
        return `Available: ${sorted[0].toLocaleDateString()} - ${sorted.at(-1)?.toLocaleDateString()}`;
    };


    if (loading) return <ListingDetailSkeleton />;
    if (error) return <div className="pt-[10vh] text-red-600 text-center">{error}</div>;
    if (!listing) return <div className="pt-[10vh] text-center">Listing not found.</div>;

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
                        formatAvailability={formatAvailability} // Pass the formatter
                        // Removed startDate, endDate, handleDateChange props
                        handleContactHost={handleContactHost} // Now directly passes the string dates
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