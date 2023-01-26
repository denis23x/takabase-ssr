/** @format */

export interface UserCreateDto {
	name: string;
	email: string;
	password?: string;
	facebookId?: string;
	githubId?: string;
	googleId?: string;
}
