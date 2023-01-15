/** @format */

import { MarkdownControl } from '../../../core';

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
	}
];

export const MarkdownControlList = (): MarkdownControl[] => [
	{
		key: 'list-unordered',
		label: 'Unordered',
		handler: (value: string): string => '+ ' + value
	},
	{
		key: 'list-ordered',
		label: 'Ordered',
		handler: (value: string): string => '1. ' + value
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
		key: 'url-gist',
		label: 'Gist',
		icon: 'github',
		handler: (value: any): string => `@[Github](${value.url})`
	},
	{
		key: 'url-youtube',
		label: 'Video',
		icon: 'youtube',
		handler: (value: any): string => `@[Youtube](${value.url})`
	}
];

// TODO: add controls
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
