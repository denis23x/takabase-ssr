/** @format */

export interface UserGetOneDto {
  scope: string[];
}

export interface UserGetAllDto {
  name?: string;
  page: number;
  size: number;
  scope?: string[];
}
