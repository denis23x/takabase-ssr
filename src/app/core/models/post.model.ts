/** @format */

import { User } from './user.model';
import { Category } from './category.model';

export interface Post {
  id: number;
  title: string;
  body: string;
  image: string | null;
  user: User;
  category: Category;
  createdAt: string;
  updatedAt: string;
}
