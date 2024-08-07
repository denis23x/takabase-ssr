/** @format */

import { PostGetAllDto } from '../post/post-get-all.dto';

export interface PostBookmarkGetAllDto extends PostGetAllDto {
	attachPost?: boolean;
}
