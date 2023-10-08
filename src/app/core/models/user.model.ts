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
	firebaseId?: string;
	facebookId?: string;
	githubId?: string;
	googleId?: string;
	email?: string;
	emailConfirmed?: boolean;
	categories?: Category[];
	avatar: string | null;
	sessions: Session[];
	settings?: Settings;
	createdAt: string;
	updatedAt: string;
}
