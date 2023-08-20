/** @format */

export interface CategoryGetAllDto {
	query?: string;
	userId?: number;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
