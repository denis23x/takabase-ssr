/** @format */

export interface CategoryGetAllDto {
	userName?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
