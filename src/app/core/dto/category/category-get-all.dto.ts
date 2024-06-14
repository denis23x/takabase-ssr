/** @format */

export interface CategoryGetAllDto {
	userId?: number;
	userName?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
