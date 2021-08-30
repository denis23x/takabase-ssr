/** @format */

export interface MarkdownControl {
  key: string;
  label: string;
  icon: string;
  handler(selection?: string, handler?: string): string;
}
