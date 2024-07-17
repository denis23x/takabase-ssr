/** @format */

export interface MarkdownControl {
	type: string;
	key: string;
	label: string;
	classList?: string[];
	icon?: string;
	handler(markdownTextarea: MarkdownTextarea | null, type: string, params?: any): string;
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
	label: string;
	key: string;
	shortcut: string[];
}

export interface MarkdownItPlugins {
	prism?: boolean;
	mermaid?: boolean;
	collapsible?: boolean;
	emoji?: boolean;
	smartArrows?: boolean;
	tasks?: boolean;
	video?: boolean;
}
