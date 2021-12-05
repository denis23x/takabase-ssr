/** @format */

import { User } from './user.model';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  user: User;
}

export interface CategoryState {
  action: string;
  category: Category;
}
