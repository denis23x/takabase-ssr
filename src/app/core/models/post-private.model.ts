/** @format */

import type { Post } from './post.model';

export interface PostPrivate extends Exclude<Post, 'category'> {}
