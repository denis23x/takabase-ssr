/** @format */

export interface UserGetAllDto {
  name?: string;
  exact?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface UserGetOneDto {
  scope?: string[];
}

export interface UserUpdateDto {
  name?: string;
  biography?: number;
}
