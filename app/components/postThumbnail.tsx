// components/PostThumbnail.tsx
'use client';
import React from 'react';
import Image from 'next/image';

interface User {
  _id: string;
  username: string;
  profilePic?: string;
}

interface Post {
  _id: string;
  caption: string;
  imageUrl: string;
  images: string[];
  user: User;
  createdAt: string;
}

interface PostThumbnailProps {
  post: Post;
  onClick: (post: Post) => void;
}

const PostThumbnail: React.FC<PostThumbnailProps> = ({ post, onClick }) => {
  return (
    <div
      onClick={() => onClick(post)}
      className="relative aspect-square cursor-pointer overflow-hidden"
    >
      <Image
        src={post.imageUrl}
        alt="Post"
        fill
        className="object-cover hover:brightness-75 transition-all duration-200"
      />
    </div>
  );
};

export default PostThumbnail;
