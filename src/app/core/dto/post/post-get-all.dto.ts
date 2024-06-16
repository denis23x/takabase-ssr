/** @format */

export interface PostGetAllDto {
	userId?: number;
	userName?: string;
	categoryId?: number;
	query?: string;
	page?: number;
	size?: number;
	scope?: string[];
}
