/** @format */

export interface CategoryCreateDto {
  name: string;
}

export interface CategoryGetAllDto {
  name?: string;
  userId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface CategoryGetOneDto {
  scope?: string[];
}

export interface CategoryUpdateDto {
  name: string;
}
