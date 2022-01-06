/** @format */
import { Category } from './category.model';

export interface User {
  id: number;
  name: string;
  biography: string | null;
  categories?: Category[];
  avatar: string | null;
  email?: string;
  accessToken?: string;
  interfaceConfig?: UserInterface;
  createdAt: string;
  updatedAt: string;
}

export interface UserInterface {
  colorTheme: string;
}
