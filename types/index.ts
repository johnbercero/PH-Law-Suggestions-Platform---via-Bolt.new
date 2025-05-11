// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  isAdmin: boolean;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData extends SignInData {
  name: string;
}

// Suggestion Types
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  attachments?: Attachment[];
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  upvotes: number;
  downvotes: number;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'sent';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
}

// Vote Types
export interface Vote {
  userId: string;
  suggestionId: string;
  type: 'upvote' | 'downvote';
  createdAt: Date;
}

// Filter and Sort Types
export interface SuggestionFilters {
  category?: string;
  status?: SuggestionStatus;
  timeFrame?: 'day' | 'week' | 'month' | 'year' | 'all';
  search?: string;
}

export type SortOption = 'newest' | 'oldest' | 'most-upvoted' | 'most-discussed';