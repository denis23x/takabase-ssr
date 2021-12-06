/** @format */

import { User } from './user.model';
import { Category } from './category.model';
import { NavigationExtras } from '@angular/router';

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

export interface PostExtras extends NavigationExtras {
  state?: PostState;
}

export interface PostState {
  message: string;
  post: Post;
}
