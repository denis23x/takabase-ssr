/** @format */

export interface PostGetAllDto {
	query?: string;
	userId?: number;
	categoryId?: number;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
