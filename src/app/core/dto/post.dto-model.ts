/** @format */

export interface PostCreateDto {
  body: string;
  title: string;
  image?: string;
  categoryId: number;
}

export interface PostGetAllDto {
  title?: string;
  userId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface PostGetOneDto {
  scope?: string[];
}

export interface PostUpdateDto {
  body?: string;
  title?: string;
  image?: string;
  categoryId?: number;
}
