/** @format */

export interface CategoryGetAllDto {
  name?: string;
  userId?: number;
  page: number;
  size: number;
  scope?: string[];
}
