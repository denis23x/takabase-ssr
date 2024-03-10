/** @format */

export interface PostCreateDto {
	firebaseUid: string;
	name: string;
	description: string;
	markdown: string;
	image?: string;
	categoryId: number;
}
