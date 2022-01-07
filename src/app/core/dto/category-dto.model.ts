/** @format */

export interface CategoryCreateOneDto {
  name: string;
}

export interface CategoryGetAllDto {
  name?: string;
  userId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface CategoryUpdateOneDto {
  name: string;
}
