/** @format */

import type { PostCreateDto } from '../post/post-create.dto';

export interface PostPasswordCreateDto extends Omit<PostCreateDto, 'categoryId'> {}
