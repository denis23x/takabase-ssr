/** @format */

import { User } from './user.model';
import { NavigationExtras } from '@angular/router';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  user: User;
}

export interface CategoryExtras extends NavigationExtras {
  state?: CategoryState;
}

export interface CategoryState {
  message: string;
  category: Category;
}
