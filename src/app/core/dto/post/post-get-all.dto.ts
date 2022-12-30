/** @format */

export interface PostGetAllDto {
	name?: string;
	userId?: number;
	categoryId?: number;
	page?: number;
	size?: number;
	scope?: string[];
}
