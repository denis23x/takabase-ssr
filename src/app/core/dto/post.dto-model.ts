/** @format */

export interface PostCreateOneDto {
  body: string;
  title: string;
  categoryId: number;
  image?: string;
}

export interface PostGetOneDto {
  scope?: string[];
}

export interface PostGetAllDto {
  title?: string;
  userId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}

export interface PostUpdateOneDto {
  body?: string;
  title?: string;
  categoryId?: number;
  image?: string;
}
