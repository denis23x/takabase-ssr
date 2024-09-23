/** @format */

export interface PostCreateDto {
	name: string;
	description: string;
	markdown: string;
	cover?: string;
	categoryId?: number;
	password?: number;
}
