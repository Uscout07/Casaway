// components/CommentItem.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Comment } from './listingPageTypes'; // Assuming you create a types.ts file

interface CommentItemProps {
    comment: Comment;
    isReply?: boolean;
    loggedInUserId: string | null;
    handleCommentLikeToggle: (commentId: string) => void;
    handleAddComment: (text: string, parentId: string | null) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    isReply = false,
    loggedInUserId,
    handleCommentLikeToggle,
    handleAddComment,
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [visibleRepliesCount, setVisibleRepliesCount] = useState(3);
    const replyInputRef = useRef<HTMLInputElement>(null);

    const handleReplySubmit = () => {
        const value = replyInputRef.current?.value.trim();
        if (value) {
            // Determine parentId based on whether it's a direct reply or a reply to a reply
            const parentId = isReply ? comment.parentCommentId || comment._id : comment._id;
            handleAddComment(value, parentId);
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

    // These values now correctly come from the `comment` object, which PostModal is responsible for updating.
    const isLikedByUser = comment.isLikedByUser ?? false; // Use nullish coalescing for safety
    const likesCount = comment.likesCount ?? 0; // Use nullish coalescing for safety

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
                        {comment.text} {/* Kept as .text as in your original */}
                    </p>
                    <div className={`flex items-center space-x-4 ${isReply ? 'text-xs' : 'text-sm'}`}>
                        <button
                            onClick={() => handleCommentLikeToggle(comment._id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                            disabled={!loggedInUserId}
                        >
                            <Icon
                                icon={isLikedByUser ? "material-symbols:favorite" : "material-symbols:favorite-outline"}
                                className={`${isReply ? 'w-3 h-3' : 'w-4 h-4'} ${isLikedByUser ? 'text-red-500' : ''}`}
                            />
                            <span>{likesCount}</span>
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
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            isReply={true}
                            loggedInUserId={loggedInUserId}
                            handleCommentLikeToggle={handleCommentLikeToggle}
                            handleAddComment={handleAddComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;