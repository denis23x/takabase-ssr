/** @format */

export interface UserGetAllDto {
	name?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
