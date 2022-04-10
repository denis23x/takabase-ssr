/** @format */

export interface UserUpdateDto {
  name?: string;
  biography?: string;
  avatar?: string;
  email?: string;

  // TODO: remake to proper model

  settings: any;
}
