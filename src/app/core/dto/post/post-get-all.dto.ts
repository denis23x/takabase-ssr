/** @format */

export interface PostGetAllDto {
	query?: string;
	userFirebaseUid?: string;
	userName?: string;
	categoryId?: number;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
