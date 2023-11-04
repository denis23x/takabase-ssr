/** @format */

export interface PostGetAllDto {
	query?: string;
	userId?: number;
	userName?: string;
	categoryId?: number;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
