/** @format */

import { User } from './user.model';

export interface Category {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
