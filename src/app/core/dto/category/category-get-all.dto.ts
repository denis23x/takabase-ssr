/** @format */

export interface CategoryGetAllDto {
	userId?: number;
	username?: string;
	query?: string;
	page?: number;
	size?: number;
	scope?: string[];
}
