/** @format */

export interface CategoryGetAllDto {
	query?: string;
	userFirebaseUid?: string;
	userName?: string;
	page?: number;
	size?: number;
	orderBy?: string;
	scope?: string[];
}
