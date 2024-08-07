/** @format */

export interface PostBookmark {
	id: number;
	postId: number;
	userFirebaseUid: string;
	password?: string;
	createdAt: string;
	updatedAt: string;
}
