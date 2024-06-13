/** @format */

export interface PostGetAllDto {
	categoryId?: number;
	userName?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
