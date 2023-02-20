/** @format */

import { MarkdownControl } from '../../../core/models/markdown.model';

export const MarkdownControlHeading = (): MarkdownControl[] => [
	{
		key: 'heading-h1',
		label: 'Heading 1',
		classList: ['text-4xl', 'font-extrabold'],
		handler: (value: string): string => '# ' + value
	},
	{
		key: 'heading-h2',
		label: 'Heading 2',
		classList: ['text-2xl', 'font-bold'],
		handler: (value: string): string => '## ' + value
	},
	{
		key: 'heading-h3',
		label: 'Heading 3',
		classList: ['text-xl', 'font-semibold'],
		handler: (value: string): string => '### ' + value
	},
	{
		key: 'heading-h4',
		label: 'Heading 4',
		classList: ['text-base', 'font-semibold'],
		handler: (value: string): string => '#### ' + value
	}
];

export const MarkdownControlFormatting = (): MarkdownControl[] => [
	{
		key: 'formatting-bold',
		label: 'Bold',
		classList: ['font-semibold'],
		handler: (value: string): string => '**' + value + '**'
	},
	{
		key: 'formatting-strikethrough',
		label: 'Strikethrough',
		classList: ['line-through'],
		handler: (value: string): string => '~~' + value + '~~'
	},
	{
		key: 'formatting-italic',
		label: 'Italic',
		classList: ['italic'],
		handler: (value: string): string => '_' + value + '_'
	},
	{
		key: 'formatting-mark',
		label: 'Mark',
		classList: ['bg-primary text-primary-content p-1 !rounded'],
		handler: (value: string): string => '==' + value + '=='
	}
];

export const MarkdownControlList = (): MarkdownControl[] => [
	{
		key: 'list-unordered',
		label: 'Unordered',
		handler: (value: string): string => '- ' + value
	},
	{
		key: 'list-ordered',
		label: 'Ordered',
		handler: (value: string): string => '1. ' + value
	},
	{
		key: 'list-task',
		label: 'Task',
		handler: (value: string): string => '- [x] ' + value
	}
];

export const MarkdownControlUrl = (): MarkdownControl[] => [
	{
		key: 'url-link',
		label: 'Link',
		icon: 'link',
		handler: (value: any): string => `[${value.title}](${value.url})`
	},
	{
		key: 'url-image',
		label: 'Image',
		icon: 'image',
		handler: (value: any): string => `![${value.title}](${value.url})`
	},
	{
		key: 'url-youtube',
		label: 'Video',
		icon: 'youtube',
		handler: (value: any): string => `@[youtube](${value.url})`
	}
];

export const MarkdownControlEmojiMart = (): MarkdownControl => ({
	key: 'emoji-mart',
	label: 'Emoji',
	icon: 'emoji-heart-eyes',
	handler: (): string => ''
});

// TODO: add controls, add spoilers, image size
// export const MarkdownControlRest = (): MarkdownControl[] => [
//   {
//     key: 'text-hr',
//     label: 'Horizontal Rule',
//     icon: 'hr',
//     handler: (): string => {
//       return '\n\n---\n\n';
//     }
//   },
//   {
//     key: 'text-code',
//     label: 'Code',
//     icon: 'code-slash',
//     handler: (selection: string): string => {
//       return (
//         '\n``` language\n' +
//         (selection.length ? selection : 'Enter code here') +
//         '\n```\n'
//       );
//     }
//   }
// ];
