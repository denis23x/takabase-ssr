/** @format */

import type { Category } from './category.model';
import type { Post } from './post.model';

export interface User {
	id: number;
	name: string;
	description: string | null;
	posts?: Post[];
	categories?: Category[];
	avatar: string | null;
	createdAt: string;
	updatedAt: string;
}
