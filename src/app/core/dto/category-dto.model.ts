/** @format */

export interface CategoryCreateOneDto {
  name: string;
  isPrivate?: boolean;
}

export interface CategoryGetOneDto {
  scope?: string[];
}

export interface CategoryGetAllDto {
  name?: string;
  userId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}
