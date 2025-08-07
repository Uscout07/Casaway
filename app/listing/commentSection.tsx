// components/CommentSection.tsx
import React, { useRef } from 'react';
import CommentItem from './commentItem';
import { Icon } from '@iconify/react'; // Added Icon import
import { Comment } from './listingPageTypes'; // Assuming you create a types.ts file

interface CommentSectionProps {
    comments: Comment[];
    handleAddComment: (text: string, parentId: string | null) => void;
    handleCommentLikeToggle: (commentId: string) => void;
    loggedInUserId: string | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    handleAddComment,
    handleCommentLikeToggle,
    loggedInUserId,
}) => {
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
                // Reverted to original "No comments yet" message, but kept Icon if you have it
                <p className="text-gray-500 text-center py-6">No comments yet. Be the first to comment!</p>
            ) : (
                comments.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        loggedInUserId={loggedInUserId}
                        handleCommentLikeToggle={handleCommentLikeToggle}
                        handleAddComment={handleAddComment}
                    />
                ))
            )}
        </div>
    );
};

export default CommentSection;