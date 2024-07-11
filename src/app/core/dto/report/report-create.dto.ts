/** @format */

import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';

export interface ReportCreateDto {
	name: string;
	description: string;
	subject: User | Post;
}
