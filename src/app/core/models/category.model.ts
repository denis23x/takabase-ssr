/** @format */

import type { User } from './user.model';
import type { Post } from './post.model';

export interface Category {
	id: number;
	name: string;
	description: string;
	user?: User;
	posts?: Post[];
	createdAt: string;
	updatedAt: string;
}
