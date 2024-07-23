/** @format */

import type { PostUpdateDto } from '../post/post-update.dto';

export interface PostPrivateUpdateDto extends Omit<PostUpdateDto, 'categoryId'> {}
