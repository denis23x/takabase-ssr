/** @format */

export interface PostHandlerDto {
  title: string;
  body: string;
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
