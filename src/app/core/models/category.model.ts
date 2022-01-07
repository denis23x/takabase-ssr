/** @format */

import { User } from './user.model';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
