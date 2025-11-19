// types/index.ts
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  imageUrl?: string;
  author: string;
  authorId: string;
  createdAt: any;
  updatedAt?: any;
  likes: string[];
  tags?: string[];
  category?: string;
  readTime?: number;
  views?: number;
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: any;
  postId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
  website?: string;
  location?: string;
  joinedAt: any;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}