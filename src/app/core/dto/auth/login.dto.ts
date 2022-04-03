/** @format */

export interface LoginDto {
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  fingerprint?: string;
  scope?: string[];
}
