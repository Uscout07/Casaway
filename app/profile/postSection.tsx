// app/components/PostsSection.tsx
import React from 'react';
import { Icon } from '@iconify/react';
import { Post } from './profileTypes'; // Adjust path as necessary

interface PostsSectionProps {
    posts: Post[];
    postsLoading: boolean;
    postsError: string | null;
    onPostClick: (post: Post) => void;
}

const PostsSection: React.FC<PostsSectionProps> = ({ posts, postsLoading, postsError, onPostClick }) => {
    return (
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-20 mx-auto py-10 max-w-screen">
  <h2 className="text-[18px] font-bold font-inter text-forest mb-6 hidden">Posts</h2>

  {postsLoading ? (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
      ))}
    </div>
  ) : postsError ? (
    <div className="text-center py-8">
      <Icon
        icon="material-symbols:error-outline"
        className="w-8 h-8 mb-2 mx-auto text-red-500"
      />
      <p className="text-red-600">{postsError}</p>
    </div>
  ) : posts.length > 0 ? (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-10">
      {posts.map((post) => (
        <div
          key={post._id}
          className="aspect-square w-[340px] overflow-hidden cursor-pointer"
          onClick={() => onPostClick(post)}
        >
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="object-cover w-full h-full hover:opacity-90 transition-opacity"
          />
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <Icon
        icon="material-symbols:article-outline"
        className="w-12 h-12 mb-4 mx-auto text-gray-400"
      />
      <p className="text-forest">No posts found</p>
    </div>
  )}
</div>

    );
};

export default PostsSection;