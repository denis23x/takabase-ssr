/** @format */

import type {
	MarkdownControl,
	MarkdownTextarea,
	MarkdownWrapper,
	MarkdownWrapperPayload
} from '../models/markdown.model';

/** Selection */

export const getSelectionStart = (value: string, i: number): number => {
	while (value[i] === ' ' || value[i] === '\n') {
		i++;
	}

	return i;
};

export const getSelectionEnd = (value: string, i: number): number => {
	const ahead = (): number => i - 1;

	while (value[ahead()] === ' ' || value[ahead()] === '\n') {
		i--;
	}

	return i;
};

/** Wrapper */

export const getWrapper = (value: string): MarkdownWrapperPayload => {
	if (!!value.length) {
		return {
			space: value === ' ',
			newline: value === '\n',
			character: value !== ' ' && value !== '\n'
		};
	} else {
		return {
			space: false,
			newline: false,
			character: false
		};
	}
};

export const setWrapper = (value: string, markdownTextarea: MarkdownTextarea, type?: string): string => {
	const wrapper: MarkdownWrapper = markdownTextarea.wrapper;

	let before: string = '';
	let after: string = '';

	if (type === 'block') {
		if (wrapper.before.space || wrapper.before.character) {
			before = '\n\n';

			if (wrapper.after.space || wrapper.after.character) {
				after = '\n\n';
			}
		}

		if (wrapper.before.newline) {
			if (wrapper.after.space || wrapper.after.character) {
				after = '\n\n';
			}
		}

		return before + value + after;
	}

	if (type === 'inline') {
		if (wrapper.before.character) {
			before = ' ';
		}

		if (wrapper.after.character) {
			after = ' ';
		}

		return before + value + after;
	}

	return value;
};

/** Controls */

export const MarkdownControlHeading = (): MarkdownControl[] => [
	{
		type: 'block',
		key: 'heading-h1',
		label: 'Heading 1',
		classList: ['text-4xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Heading 1';

			return setWrapper(`# ${origin}`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'heading-h2',
		label: 'Heading 2',
		classList: ['text-2xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Heading 2';

			return setWrapper(`## ${origin}`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'heading-h3',
		label: 'Heading 3',
		classList: ['text-xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Heading 3';

			return setWrapper(`### ${origin}`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'heading-h4',
		label: 'Heading 4',
		classList: ['text-base', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Heading 4';

			return setWrapper(`#### ${origin}`, markdownTextarea, type);
		}
	}
];

export const MarkdownControlFormatting = (): MarkdownControl[] => [
	{
		type: 'inline',
		key: 'formatting-bold',
		label: 'Bold',
		classList: ['font-bold'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Bold text';

			return setWrapper(`**${origin}**`, markdownTextarea, type);
		}
	},
	{
		type: 'inline',
		key: 'formatting-strikethrough',
		label: 'Strikethrough',
		classList: ['line-through'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Strikethrough text';

			return setWrapper(`~~${origin}~~`, markdownTextarea, type);
		}
	},
	{
		type: 'inline',
		key: 'formatting-italic',
		label: 'Italic',
		classList: ['italic'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Italic text';

			return setWrapper(`*${origin}*`, markdownTextarea, type);
		}
	},
	{
		type: 'inline',
		key: 'formatting-underline',
		label: 'Underline',
		classList: ['underline'],
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Underline text';

			return setWrapper(`++${origin}++`, markdownTextarea, type);
		}
	}
];

export const MarkdownControlList = (): MarkdownControl[] => [
	{
		type: 'block',
		key: 'list-unordered',
		label: 'Unordered',
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Unordered list';

			return setWrapper(`- ${origin}`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'list-ordered',
		label: 'Ordered',
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Ordered list';

			return setWrapper(`1. ${origin}`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'list-checkbox',
		label: 'Checkbox',
		handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
			const origin: string = markdownTextarea.selection || 'Checkbox list';

			return setWrapper(`- [x] ${origin}`, markdownTextarea, type);
		}
	}
];

export const MarkdownControlQuote = (): MarkdownControl => ({
	type: 'block',
	key: 'quote',
	label: 'Quote',
	icon: 'quote',
	handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
		const origin: string = markdownTextarea.selection || 'Quote';

		return setWrapper(`> ${origin}`, markdownTextarea, type);
	}
});

export const MarkdownControlUrl = (): MarkdownControl[] => [
	{
		type: 'inline',
		key: 'url-link',
		label: 'Link',
		icon: 'link-45deg',
		handler: (markdownTextarea: MarkdownTextarea, type: string, formValue: any): string => {
			return setWrapper(`[${formValue.title}](${formValue.url})`, markdownTextarea, type);
		}
	},
	{
		type: 'block',
		key: 'url-youtube',
		label: 'YouTube',
		icon: 'youtube',
		handler: (markdownTextarea: MarkdownTextarea, type: string, formValue: any): string => {
			return setWrapper(`@[youtube](${formValue.url})`, markdownTextarea, type);
		}
	}
];

export const MarkdownControlCropper = (): MarkdownControl => ({
	type: 'block',
	key: 'cropper',
	label: 'Image',
	icon: 'image',
	handler: (markdownTextarea: MarkdownTextarea, type: string, formValue: any): string => {
		return setWrapper(`![${formValue.title}](${formValue.url})`, markdownTextarea, type);
	}
});

export const MarkdownControlEmojiMart = (): MarkdownControl => ({
	type: 'inline',
	key: 'emoji-mart',
	label: 'Emoji',
	icon: 'emoji-heart-eyes',
	handler: (): string => ''
});

export const MarkdownControlTable = (): MarkdownControl => ({
	type: 'block',
	key: 'table',
	label: 'Table',
	icon: 'table',
	handler: (markdownTextarea: MarkdownTextarea, type: string, index: number): string => {
		const columns: number = (index % 5) + 1;
		const rows: number = (index - (columns - 1)) / 5 + 1;

		/** Get ready columns */

		const getReadyColumns = (header: boolean, value?: string): string => {
			const column: string[] = [];
			const columnText: string = ` ${value} `;

			for (let i: number = 0; i < columns; i++) {
				column.push(header ? ' ------ ' : columnText);
			}

			return '|' + column.join('|') + '|';
		};

		/** Get ready rows */

		const readyRows: string[] = [];

		readyRows.push(getReadyColumns(false, 'Header'));
		readyRows.push(getReadyColumns(true));

		for (let i: number = 0; i < rows; i++) {
			readyRows.push(getReadyColumns(false, 'Column'));
		}

		const value: string = readyRows.join('\n');

		return setWrapper(value, markdownTextarea, type);
	}
});

export const MarkdownControlSpoiler = (): MarkdownControl => ({
	type: 'block',
	key: 'spoiler',
	label: 'Spoiler',
	icon: 'arrows-collapse',
	handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
		const origin: string = markdownTextarea.selection || 'Type your details';

		return setWrapper(`+++ Click me!\n${origin}\n+++`, markdownTextarea, type);
	}
});

export const MarkdownControlCode = (): MarkdownControl => ({
	type: 'block',
	key: 'code',
	label: 'Code',
	icon: 'code-slash',
	handler: (markdownTextarea: MarkdownTextarea, type: string): string => {
		const origin: string = markdownTextarea.selection || 'Type your code';

		return setWrapper(`\`\`\` text\n${origin}\n\`\`\``, markdownTextarea, type);
	}
});
