/** @format */

export interface PostGetAllDto {
	userId?: number;
	username?: string;
	categoryId?: number;
	query?: string;
	page: number;
	size: number;
	scope?: string[];
}
