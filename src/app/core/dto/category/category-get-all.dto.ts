/** @format */

export interface CategoryGetAllDto {
	query?: string;
	userId?: number;
	userName?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
