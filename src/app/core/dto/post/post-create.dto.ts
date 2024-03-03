/** @format */

export interface PostCreateDto {
	name: string;
	firebaseId: string;
	description: string;
	markdown: string;
	image?: string;
	categoryId: number;
}
