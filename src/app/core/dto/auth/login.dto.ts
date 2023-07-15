/** @format */

export interface LoginDto {
	email: string;
	password?: string;
	facebookId?: string;
	githubId?: string;
	googleId?: string;
	fingerprint?: string;
	scope?: string[];
}
