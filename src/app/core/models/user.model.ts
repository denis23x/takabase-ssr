/** @format */

import { Category } from './category.model';
import { Post } from './post.model';
import { Settings } from './settings.model';

export interface User {
	id: number;
	name: string;
	description: string | null;
	posts?: Post[];
	categories?: Category[];
	avatar: string | null;
	settings?: Settings;
	createdAt: string;
	updatedAt: string;
}
