/** @format */

import { User } from '../../../user/core';
import { Category } from '../../../category/core';

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
