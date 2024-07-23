/** @format */

import type { PostGetAllDto } from '../post/post-get-all.dto';

export interface PostPasswordGetAllDto extends Exclude<PostGetAllDto, 'categoryId'> {}
