/** @format */

export interface PostGetAllDto {
  title?: string;
  userId?: number;
  categoryId?: number;
  page?: number;
  size?: number;
  scope?: string[];
}
