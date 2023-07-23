/** @format */

import { Category } from './category.model';
import { Session } from './session.model';
import { Post } from './post.model';
import { Settings } from './settings.model';

export interface User {
	id: number;
	name: string;
	description: string | null;
	posts?: Post[];
	categories?: Category[];
	avatar: string | null;
	email?: string;
	emailConfirmed?: boolean;
	sessions: Session[];
	token?: string;
	settings?: Settings;
	createdAt: string;
	updatedAt: string;
}
