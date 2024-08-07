/** @format */

import { PostGetOneDto } from '../post/post-get-one.dto';

export interface PostBookmarkGetOneDto extends PostGetOneDto {
	attachPost?: boolean;
}
