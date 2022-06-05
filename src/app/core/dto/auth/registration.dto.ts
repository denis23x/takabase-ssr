/** @format */

export interface RegistrationDto {
  name: string;
  email: string;
  password?: string;
  facebookId?: string;
  githubId?: string;
  googleId?: string;
}
