/** @format */

import type { PostUpdateDto } from '../post/post-update.dto';

export interface PostPasswordUpdateDto extends Omit<PostUpdateDto, 'categoryId'> {}
