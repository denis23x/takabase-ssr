/** @format */

import type { PostUpdateDto } from '../post/post-update.dto';

export interface PostPrivateUpdateDto extends Exclude<PostUpdateDto, 'categoryId'> {}
