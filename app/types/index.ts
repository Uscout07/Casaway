// types/index.ts

export interface User {
    _id: string;
    name: string;
    username: string;
    city: string;
    country: string;
    bio: string;
    profilePic?: string;
    phone?: string;
    role: 'user' | 'admin';
    followers: string[];
    following: string[];
    instagramUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Listing {
    _id: string;
    title: string;
    details: string;
    type: 'Single Room' | 'Whole Apartment' | 'Whole House';
    amenities: string[];
    features: string[];
    city: string;
    country: string;
    roommates: string[]; // <--- **CHANGE THIS TO string[]**
    tags: string[];
    availability: {
        startDate: string;
        endDate: string;
    }[];
    
    thumbnail: string;
    user: {
        _id: string;
        name: string;
    };
        description: string;
        price: number;
        category: string;
        condition: string;
        images: string[];
        owner: string | User; // Can be string ID or populated User object
        createdAt: string;
        updatedAt: string;
        location?: string;
    
}

export interface Post {
    _id: string;
    user: {
        _id: string;
        name: string;
        username: string;
        profilePic?: string;
    };
    caption: string;
    tags: string[];
    city: string;
    country: string;
    imageUrl: string;
    images: string[];
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

