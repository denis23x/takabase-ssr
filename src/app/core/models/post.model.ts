/** @format */

import type { User } from './user.model';
import type { Category } from './category.model';

export interface Post {
	id: number;
	name: string;
	description: string;
	markdown?: string;
	cover: string | null;
	user?: User;
	category?: Category;
	password?: string;
	createdAt: string;
	updatedAt: string;
}
