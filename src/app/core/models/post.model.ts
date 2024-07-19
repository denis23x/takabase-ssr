/** @format */

import type { User } from './user.model';
import type { Category } from './category.model';

export interface Post {
	id: number;
	firebaseUid: string;
	name: string;
	description: string;
	markdown?: string;
	image: string | null;
	user?: User;
	category?: Category;
	createdAt: string;
	updatedAt: string;
}
