/** @format */

import {
	MarkdownControl,
	MarkdownTextarea,
	MarkdownWrapper
} from '../../../core/models/markdown.model';

// prettier-ignore
export const setWrapper = (value: string, markdownTextarea: MarkdownTextarea, type?: string): string => {
  const wrapper: MarkdownWrapper = markdownTextarea.wrapper;

  if (type === 'block') {
    let before: string = '';
    let after: string = '';

    /** Before */

    if (wrapper.before.space || wrapper.before.character) {
      before = '\n\n';
    }

    if (wrapper.before.newline) {
      before = '\n';
    }

    /** After */

    if (wrapper.after.space || wrapper.after.character) {
      after = '\n\n';
    }

    if (wrapper.after.newline) {
      after = '\n';
    }

    /** Both */

    if (wrapper.before.character && wrapper.after.newline) {
      after = '';
    }

    return before + value + after;
  }

  if (type === 'inline') {
    let before: string = '';
    let after: string = '';

    /** Before */

    if (wrapper.before.character) {
      before = ' ';
    }

    /** After */

    if (wrapper.after.character) {
      after = ' ';
    }

    return before + value + after;
  }

  return value;
}

// prettier-ignore
export const MarkdownControlHeading = (): MarkdownControl[] => [
	{
		key: 'heading-h1',
		label: 'Heading 1',
		classList: ['text-4xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('# ' + (markdownTextarea.selection || 'Heading 1'), markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h2',
		label: 'Heading 2',
		classList: ['text-2xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
      return setWrapper('## ' + (markdownTextarea.selection || 'Heading 2'), markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h3',
		label: 'Heading 3',
		classList: ['text-xl', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
      return setWrapper('### ' + (markdownTextarea.selection || 'Heading 3'), markdownTextarea, 'block');
		}
	},
	{
		key: 'heading-h4',
		label: 'Heading 4',
		classList: ['text-base', 'font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
      return setWrapper('#### ' + (markdownTextarea.selection || 'Heading 4'), markdownTextarea, 'block');
		}
	}
];

// prettier-ignore
export const MarkdownControlFormatting = (): MarkdownControl[] => [
	{
		key: 'formatting-bold',
		label: 'Bold',
		classList: ['font-bold'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('**' + (markdownTextarea.selection || 'Bold text') + '**', markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-strikethrough',
		label: 'Strikethrough',
		classList: ['line-through'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('~~' + (markdownTextarea.selection || 'Strikethrough text') + '~~', markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-italic',
		label: 'Italic',
		classList: ['italic'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('_' + (markdownTextarea.selection || 'Italic text') + '_', markdownTextarea, 'inline');
		}
	},
	{
		key: 'formatting-mark',
		label: 'Mark',
		classList: ['bg-primary text-primary-content p-1 !rounded'],
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('==' + (markdownTextarea.selection || 'Marked text') + '==', markdownTextarea, 'inline');
		}
	}
];

// prettier-ignore
export const MarkdownControlList = (): MarkdownControl[] => [
	{
		key: 'list-unordered',
		label: 'Unordered',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('- ' + (markdownTextarea.selection || 'Unordered list'), markdownTextarea, 'block');
		}
	},
	{
		key: 'list-ordered',
		label: 'Ordered',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('1. ' + (markdownTextarea.selection || 'Ordered list'), markdownTextarea, 'block');
		}
	},
	{
		key: 'list-task',
		label: 'Task',
		handler: (markdownTextarea: MarkdownTextarea): string => {
			return setWrapper('- [x]  ' + (markdownTextarea.selection || 'Task list'), markdownTextarea, 'block');
		}
	}
];

// prettier-ignore
export const MarkdownControlUrl = (): MarkdownControl[] => [
	{
		key: 'url-link',
		label: 'Link',
		icon: 'link',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			return setWrapper(`[${payload.title}](${payload.url})`, markdownTextarea, 'inline');
		}
	},
	{
		key: 'url-image',
		label: 'Image',
		icon: 'image',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			return setWrapper(`![${payload.title}](${payload.url})`, markdownTextarea, 'block');
		}
	},
	{
		key: 'url-youtube',
		label: 'Video',
		icon: 'youtube',
		handler: (markdownTextarea: MarkdownTextarea, payload: any): string => {
			return setWrapper(`@[youtube](${payload.url})`, markdownTextarea, 'block');
		}
	}
];

export const MarkdownControlEmojiMart = (): MarkdownControl => ({
	key: 'emoji-mart',
	label: 'Emoji',
	icon: 'emoji-heart-eyes',
	handler: (): string => ''
});

// prettier-ignore
export const MarkdownControlCode = (): MarkdownControl => ({
	key: 'code',
	label: 'Code',
	icon: 'code-slash',
	handler: (markdownTextarea: MarkdownTextarea): string => {
		return setWrapper('``` text\n' + (markdownTextarea.selection || 'Type your code') + '\n```', markdownTextarea, 'block');
	}
});
