/** @format */

import type { User } from '../../models/user.model';
import type { Post } from '../../models/post.model';

export interface ReportCreateDto {
	name: string;
	description: string;
	subject: User | Post;
}
