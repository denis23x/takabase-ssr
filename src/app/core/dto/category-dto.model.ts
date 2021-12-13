/** @format */

export interface CategoryHandlerDto {
  name: string;
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
