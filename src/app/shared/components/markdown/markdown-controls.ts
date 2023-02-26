/** @format */

import {
	MarkdownControl,
	MarkdownTextarea
} from '../../../core/models/markdown.model';

// prettier-ignore
export const MarkdownControlWrapper = (value: string, markdownTextarea: MarkdownTextarea, type?: string): string => {
  const { selectionBefore, selectionAfter } = markdownTextarea.selectionPayload;

  if (type === 'block') {
    let before: string = '';
    let after: string = '';

    /** Before */

    if (selectionBefore.space || selectionBefore.character) {
      before = '\n\n';
    }

    if (selectionBefore.newline) {
      before = '\n';
    }

    /** After */

    if (selectionAfter.space || selectionAfter.character) {
      after = '\n\n';
    }

    if (selectionAfter.newline) {
      after = '\n';
    }

    /** Both */

    if (selectionBefore.character && selectionAfter.newline) {
      after = '';
    }

    return before + value + after;
  }

  if (type === 'inline') {
    let before: string = '';
    let after: string = '';

    /** Before */

    if (selectionBefore.character) {
      before = ' ';
    }

    /** After */

    if (selectionAfter.character) {
      after = ' ';
    }

    return before + value + after;
  }

  return value;
}

export const MarkdownControlHeading = (): MarkdownControl[] => [
	{
		key: 'heading-h1',
		label: 'Heading 1',
		classList: ['text-4xl', 'font-extrabold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			const value: string = '# ' + (markdownTextarea.selection || 'Heading 1');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h2',
		label: 'Heading 2',
		classList: ['text-2xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			const value: string = '## ' + (markdownTextarea.selection || 'Heading 2');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h3',
		label: 'Heading 3',
		classList: ['text-xl', 'font-semibold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '### ' + (markdownTextarea.selection || 'Heading 3');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h4',
		label: 'Heading 4',
		classList: ['text-base', 'font-semibold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '#### ' + (markdownTextarea.selection || 'Heading 4');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	}
];

export const MarkdownControlFormatting = (): MarkdownControl[] => [
	{
		key: 'formatting-bold',
		label: 'Bold',
		classList: ['font-semibold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '**' + (markdownTextarea.selection || 'Bold text') + '**';

			return MarkdownControlWrapper(value, markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-strikethrough',
		label: 'Strikethrough',
		classList: ['line-through'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '~~' + (markdownTextarea.selection || 'Strikethrough text') + '~~';

			return MarkdownControlWrapper(value, markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-italic',
		label: 'Italic',
		classList: ['italic'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '_' + (markdownTextarea.selection || 'Italic text') + '_';

			return MarkdownControlWrapper(value, markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-mark',
		label: 'Mark',
		classList: ['bg-primary text-primary-content p-1 !rounded'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '==' + (markdownTextarea.selection || 'Marked text') + '==';

			return MarkdownControlWrapper(value, markdownTextarea, 'inline');
		}
	}
];

export const MarkdownControlList = (): MarkdownControl[] => [
	{
		key: 'list-unordered',
		label: 'Unordered',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '- ' + (markdownTextarea.selection || 'Unordered list');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'list-ordered',
		label: 'Ordered',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '1. ' + (markdownTextarea.selection || 'Ordered list');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'list-task',
		label: 'Task',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			// prettier-ignore
			const value: string = '- [x]  ' + (markdownTextarea.selection || 'Task list');

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	}
];

export const MarkdownControlUrl = (): MarkdownControl[] => [
	{
		key: 'url-link',
		label: 'Link',
		icon: 'link',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			const value: string = `[${payload.title}](${payload.url})`;

			return MarkdownControlWrapper(value, markdownTextarea, 'inline');
		}
	},
	{
		key: 'url-image',
		label: 'Image',
		icon: 'image',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			const value: string = `![${payload.title}](${payload.url})`;

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	},
	{
		key: 'url-youtube',
		label: 'Video',
		icon: 'youtube',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			const value: string = `@[youtube](${payload.url})`;

			return MarkdownControlWrapper(value, markdownTextarea, 'block');
		}
	}
];

export const MarkdownControlEmojiMart = (): MarkdownControl => ({
	key: 'emoji-mart',
	label: 'Emoji',
	icon: 'emoji-heart-eyes',
	handler: (): string => ''
});

export const MarkdownControlCode = (): MarkdownControl => ({
	key: 'code',
	label: 'Code',
	icon: 'code-slash',
	handler: (markdownTextarea: MarkdownTextarea): string => {
		// prettier-ignore
		const value: string = markdownTextarea.selection || 'Your code';

		// prettier-ignore
		const template: string = '``` text\n' + value + '\n```';

		return MarkdownControlWrapper(template, markdownTextarea, 'block');
	}
});
