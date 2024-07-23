/** @format */

import type { Post } from './post.model';

export interface PostPassword extends Exclude<Post, 'category'> {}
