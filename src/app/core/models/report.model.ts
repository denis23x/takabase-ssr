/** @format */

import { User } from './user.model';

export interface Report {
	id: number;
	name: string;
	description: string;
	user?: User;
	createdAt: string;
	updatedAt: string;
}
