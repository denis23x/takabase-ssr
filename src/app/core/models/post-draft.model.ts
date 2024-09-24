/** @format */

import type { PostType } from './post.model';

export interface PostDraft {
	key?: string;
	postForm: any;
	postType: PostType;
	expiredAt: string;
}
