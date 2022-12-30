/** @format */

import { User } from './user.model';
import { Category } from './category.model';

export interface Post {
	id: number;
	name: string;
	description: string;
	markdown: string;
	image: string | null;
	user: User;
	category: Category;
	createdAt: string;
	updatedAt: string;
}
