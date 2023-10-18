/** @format */

import { Category } from './category.model';
import { Session } from './session.model';
import { Post } from './post.model';
import { Settings } from './settings.model';
import firebase from 'firebase/compat';

export interface User {
	id: number;
	bearer?: string;
	name: string;
	description: string | null;
	posts?: Post[];
	firebase: firebase.User;
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
