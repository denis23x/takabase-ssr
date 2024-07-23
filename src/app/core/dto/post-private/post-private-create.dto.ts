/** @format */

import type { PostCreateDto } from '../post/post-create.dto';

export interface PostPrivateCreateDto extends Exclude<PostCreateDto, 'categoryId'> {}
