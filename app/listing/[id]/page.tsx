'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

// Components
import ListingDetailSkeleton from '../listingDetailsSkeleton';
import ListingGallery from '../postGallery';
import ListingDetailsCard from '../listingCard';
import ProfileHeader from '../HostCard';
import CommentSection from '../commentSection';

// Types
import { User, Listing, Comment } from '../listingPageTypes';

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
      setLoggedInUserId("mock-logged-in-user-id");
    }
  }, []);

  useEffect(() => {
    if (!listingId) return;
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/listing/${listingId}`);
        if (!res.ok) throw new Error('Listing not found');
        const data: Listing = await res.json();
        setListing(data);
        setMainImage(data.images[0] || data.thumbnail);
      } catch (err: any) {
        console.error('Listing fetch error:', err);
        setError(err.message || 'Listing fetch failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchListingData();
  }, [listingId, API_BASE_URL]);

  // ✅ Flatten → Enrich → Re-nest
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
          .then(r => r.json()).catch(() => ({ count: 0 })),
      ]);

      console.log("Like status res:", statusRes);
      setIsLiked(statusRes.liked ?? statusRes.isLiked ?? false); // 🩹 safe
      setLikesCount(countRes.count);
    } catch (err) {
      console.error('Error fetching listing likes:', err);
    }
  })();
}, [listingId, API_BASE_URL]);


  // 🔁 Re-nesting after enrichment
  const buildNestedComments = (flatComments: Comment[]): Comment[] => {
    const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {};
    const topLevel: (Comment & { replies: Comment[] })[] = [];

    flatComments.forEach(comment => {
      commentMap[comment._id] = { ...comment, replies: [] };
    });

    flatComments.forEach(comment => {
      const parentId =
        (comment as any).parentCommentId ||
        (typeof (comment as any).parentComment === 'string'
          ? (comment as any).parentComment
          : (comment as any).parentComment?._id);

      if (parentId && commentMap[parentId]) {
        let mainParent = commentMap[parentId];

        const parentParentId =
          (commentMap[parentId] as any).parentCommentId ||
          (typeof (commentMap[parentId] as any).parentComment === 'string'
            ? (commentMap[parentId] as any).parentComment
            : (commentMap[parentId] as any).parentComment?._id);

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
      if (comment.replies?.length) {
        comment.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
  console.log("Toggling like for listing", listingId, "token:", token);

  try {
    const res = await fetch(`${API_BASE_URL}/api/likes/toggle/listing/${listingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await res.json();
    console.log("Like toggle result:", data);

    if (res.ok) {
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } else {
      alert(data.msg || 'Failed to toggle like');
    }
  } catch (error) {
    console.error('Error toggling listing like:', error);
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
        body: JSON.stringify({ text: text.trim(), parentCommentId: parentId }),
      });

      if (res.ok) {
        const newComment: Comment = await res.json();
        const enriched = {
          ...newComment,
          isLikedByUser: false,
          likesCount: 0,
        };

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
                    ),
                  }
            )
          );
        } else {
          setComments(prev => [...prev, { ...enriched, replies: [] }]);
        }
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Add comment error:', err);
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

      const data = await res.json();

      const updateRecursive = (comments: Comment[]): Comment[] =>
        comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLikedByUser: data.liked,
              likesCount: data.likesCount ?? (data.liked ? (comment.likesCount || 0) + 1 : (comment.likesCount || 0) - 1),
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateRecursive(comment.replies),
            };
          }
          return comment;
        });

      setComments(prev => updateRecursive(prev));
    } catch (err) {
      console.error('Comment like toggle failed:', err);
    }
  }, [loggedInUserId, API_BASE_URL]);

  const formatAvailability = (dates: string[]) => {
    if (!dates || dates.length === 0) return 'Not specified';
    const sorted = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    return sorted.length === 1
      ? `Available on: ${sorted[0].toLocaleDateString()}`
      : `Available: ${sorted[0].toLocaleDateString()} - ${sorted[sorted.length - 1].toLocaleDateString()}`;
  };

  if (loading) return <ListingDetailSkeleton />;
  if (error) return <div className="min-h-screen flex items-center justify-center pt-[10vh] text-red-600">Error: {error}</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center pt-[10vh]">Listing not found.</div>;

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
