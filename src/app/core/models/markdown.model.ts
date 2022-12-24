/** @format */

export interface MarkdownControl {
	key: string;
	label: string;
	classList?: string[];
	icon?: string;
	handler(selection?: string, handler?: string): string;
}

export interface MarkdownTextarea {
	selection: string;
	selectionStart: number;
	selectionEnd: number;
	value: string;
}

export interface MarkdownParser {
	[key: string]: string;
}
