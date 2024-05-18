/** @format */

export interface UserGetAllDto {
	userName?: string;
	query?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
