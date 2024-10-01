/** @format */

import type { User } from './user.model';
import type { Category } from './category.model';

export type PostType = 'category' | 'password' | 'private';

export interface Post {
	id: number;
	name: string;
	description: string;
	markdown?: string;
	cover: string | null;
	user?: User;
	category?: Category;
	createdAt: string;
	updatedAt: string;
}

export interface PostPassword extends Omit<Post, 'category'> {
	password: string;
}

export interface PostPrivate extends Omit<Post, 'category'> {}
