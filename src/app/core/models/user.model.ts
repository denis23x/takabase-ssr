/** @format */

import { Category } from './category.model';
import { Post } from './post.model';

export interface User {
  id: number;
  name: string;
  biography: string | null;
  avatar: string | null;
  email?: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  categoryList: Category[];
  postList: Post[];
}
