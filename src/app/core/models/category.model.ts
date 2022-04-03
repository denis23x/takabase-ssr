/** @format */

import { User } from './user.model';
import { Post } from './post.model';

export interface Category {
  id: number;
  name: string;
  user: User;
  posts: Post[];
  createdAt: string;
  updatedAt: string;
}
