/** @format */

import type { PostGetAllDto } from '../post/post-get-all.dto';

export interface PostPrivateGetAllDto extends Exclude<PostGetAllDto, 'categoryId'> {}
