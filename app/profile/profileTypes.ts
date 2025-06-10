// app/types/index.ts
// This file should contain your shared interfaces.

export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    profilePic?: string;
    bio?: string;
    city?: string; // Ensured as optional string
    country?: string; // Ensured as optional string
    instagramUrl?: string;
    followers?: string[]; // Array of user IDs
    following?: string[]; // Array of user IDs
    role: string;
    createdAt: string;
    updatedAt: string;
    // Add other user properties as needed
}

export interface Listing {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    images: string[];
    owner: string | User; // Can be string ID or populated User object
    createdAt: string;
    updatedAt: string;
    location?: string;
    // Add other listing properties as needed
}

export interface Post {
    _id: string;
    caption: string;
    imageUrl: string;
    user: User; // User must be a full User object here
    likes: string[]; // Array of user IDs who liked the post
    comments: string[]; // Array of comment IDs or comment objects
    createdAt: string;
    updatedAt: string;
    // Add other post properties as needed
}