/** @format */

export interface AuthLoginDto {
  email: string;
  password?: string;
  googleId?: string;
  facebookId?: string;
  fingerprint?: string;
}

export interface AuthRegistrationDto {
  name: string;
  email: string;
  password: string;
}
