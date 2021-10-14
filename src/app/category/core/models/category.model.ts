/** @format */

import { User } from '../../../user/core';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CategoryState {
  action: string;
  category: Category;
}
