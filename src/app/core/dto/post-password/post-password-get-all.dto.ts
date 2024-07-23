/** @format */

import type { PostGetAllDto } from '../post/post-get-all.dto';

export interface PostPasswordGetAllDto extends Omit<PostGetAllDto, 'categoryId' | 'userId' | 'username'> {}
