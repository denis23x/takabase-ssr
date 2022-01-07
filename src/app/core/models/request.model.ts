/** @format */

export interface RequestParams {
  [key: string]: string | string[] | number | number[];
}

export interface RequestBody extends RequestParams {}

export interface RequestError {
  error: string;
  message: string | string[];
  statusCode: number;
}

export interface RequestHeaders {
  [key: string]: string | string[];
}
