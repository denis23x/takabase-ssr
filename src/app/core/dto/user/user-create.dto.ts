/** @format */

export interface UserCreateDto {
	name: string;
	email: string;
	terms: boolean;
	password?: string;
	facebookId?: string;
	githubId?: string;
	googleId?: string;
}
