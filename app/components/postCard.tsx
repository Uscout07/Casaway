'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import PostModal from './postModal'; // adjust path as needed

interface User {
  _id: string;
  username: string;
  profilePic?: string;
  name?: string;
}

interface Post {
  _id: string;
  user: User;
  image: string;
  caption?: string;
}

interface PostCardProps {
  post: Post;
  token: string;
}

export default function PostCard({ post, token }: PostCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div
        className="relative cursor-pointer group"
        onClick={handleOpenModal}
      >
        <img
          src={post.image}
          alt="post"
          className="w-full h-auto object-cover rounded-md"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
          <Icon icon="mdi:eye" className="text-2xl" />
        </div>
      </div>

      {modalOpen && (
        <PostModal post={post} modalOpen={modalOpen} onClose={handleCloseModal} token={token} />
      )}
    </>
  );
}
