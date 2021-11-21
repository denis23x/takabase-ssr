/** @format */

export interface PostGetOneDto {
  userId?: number;
  categoryId?: number;
  scope?: string[];
}

export interface PostGetAllDto {
  title?: string;
  userId?: number;
  categoryId?: number;
  page: number;
  size: number;
  scope?: string[];
}
