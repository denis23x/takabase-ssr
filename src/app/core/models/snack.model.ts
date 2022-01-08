/** @format */

export interface Snack {
  uuid?: string;
  message: string;
  options?: SnackOptions;
}

export interface SnackOptions {
  title?: string;
  classList?: string | string[];
  duration?: number;
}
