/** @format */

import { User } from './user.model';
import { Post } from './post.model';

export interface ReportSubject {
	post?: Post;
	user?: User;
}
