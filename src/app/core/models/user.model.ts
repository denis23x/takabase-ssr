/** @format */

import { Category } from './category.model';
import { Session } from './session.model';
import { Post } from './post.model';

export interface User {
	id: number;
	name: string;
	description: string | null;
	posts?: Post[];
	categories?: Category[];
	avatar: string | null;
	email?: string;
	sessions: Session[];
	token?: string;
	settings?: UserSettings;
	createdAt: string;
	updatedAt: string;
}

export interface UserSettings {
	theme: string;
	themePrism: string;
	themeBackground: string;
	language: string;
	monospace: boolean;
	buttons: string;
}
