/** @format */

export interface UserGetAllDto {
	userId?: number;
	userName?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
