/** @format */

export interface MarkdownControl {
	key: string;
	label: string;
	classList?: string[];
	icon?: string;
	handler(markdownTextarea: MarkdownTextarea | null, payload?: any): string;
}

export interface MarkdownTextarea {
	selection: string;
	selectionStart: number;
	selectionEnd: number;
	selectionPayload: MarkdownTextareaPayload;
	value: string;
}

export interface MarkdownTextareaPayload {
	selectionBefore: MarkdownTextareaPayloadSelection;
	selectionAfter: MarkdownTextareaPayloadSelection;
}

export interface MarkdownTextareaPayloadSelection {
	space: boolean;
	newline: boolean;
	character: boolean;
}
