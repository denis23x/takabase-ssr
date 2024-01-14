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
	wrapper: MarkdownWrapper;
	value: string;
}

export interface MarkdownWrapper {
	before: MarkdownWrapperPayload;
	after: MarkdownWrapperPayload;
}

export interface MarkdownWrapperPayload {
	space: boolean;
	newline: boolean;
	character: boolean;
}

export interface MarkdownShortcut {
	id: number;
	label: string;
	key?: string;
	preventDefault: boolean;
	shortcut: string[];
}
