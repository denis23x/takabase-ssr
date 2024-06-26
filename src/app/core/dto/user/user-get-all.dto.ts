/** @format */

export interface UserGetAllDto {
	userId?: number;
	username?: string;
	query?: string;
	page?: number;
	size?: number;
	scope?: string[];
}
