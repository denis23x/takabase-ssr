/** @format */

export interface UserGetOneDto {
  scope?: string[];
}

export interface UserGetAllDto {
  name?: string;
  exact?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface UserUpdateOneDto {
  name?: string;
  biography?: number;
}
