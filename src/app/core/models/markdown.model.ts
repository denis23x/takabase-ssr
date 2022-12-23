/** @format */

export interface MarkdownControl {
	key: string;
	label: string;
	classList?: string[];
	icon?: string;
	handler(selection?: string, handler?: string): string;
}

export interface MarkdownPosition {
	positionBefore: MarkdownPositionLocation;
	positionAfter: MarkdownPositionLocation;
}

export interface MarkdownPositionLocation {
	space: boolean;
	text: string;
}

export interface MarkdownTextarea extends MarkdownPosition {
	selection: string;
	selectionStart: number;
	selectionEnd: number;
	value: string;
}

export interface MarkdownParser {
	[key: string]: string;
}
