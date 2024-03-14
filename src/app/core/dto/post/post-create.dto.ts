/** @format */

export interface PostCreateDto {
	name: string;
	description: string;
	markdown: string;
	image?: string;
	categoryId: number;
}
