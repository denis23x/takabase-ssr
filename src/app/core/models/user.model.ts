/** @format */

import { Category } from './category.model';

export interface User {
  id: number;
  name: string;
  biography: string | null;
  avatar: string | null;
  email?: string;
  accessToken?: string;
  interfaceConfig?: UserInterface;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  categoryList: Category[];
}

export interface UserInterface {
  colorTheme: string;
}
