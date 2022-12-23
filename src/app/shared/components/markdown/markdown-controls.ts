/** @format */

import { MarkdownControl } from '../../../core';

export const MarkdownControlHeading = (): MarkdownControl[] => [
	{
		key: 'heading-h1',
		label: 'Heading 1',
		classList: ['text-4xl', 'font-extrabold'],
		handler: (text: string): string => {
			return '\n# ' + (text.length ? text + '\n' : 'H1 ');
		}
	},
	{
		key: 'heading-h2',
		label: 'Heading 2',
		classList: ['text-2xl', 'font-bold'],
		handler: (text: string): string => {
			return '\n## ' + (text.length ? text + '\n' : 'H2 ');
		}
	},
	{
		key: 'heading-h3',
		label: 'Heading 3',
		classList: ['text-xl', 'font-semibold'],
		handler: (text: string): string => {
			return '\n### ' + (text.length ? text + '\n' : 'H3 ');
		}
	},
	{
		key: 'heading-h4',
		label: 'Heading 4',
		classList: ['text-base', 'font-semibold'],
		handler: (text: string): string => {
			return '\n#### ' + (text.length ? text + '\n' : 'H4 ');
		}
	}
];

export const MarkdownControlFormatting = (): MarkdownControl[] => [
	{
		key: 'formatting-bold',
		label: 'Bold',
		classList: ['font-semibold'],
		handler: (text: string): string => {
			return '**' + (text.length ? text : 'Bold') + '**';
		}
	},
	{
		key: 'formatting-strikethrough',
		label: 'Strikethrough',
		classList: ['line-through'],
		handler: (text: string): string => {
			return '~~' + (text.length ? text : 'Strikethrough') + '~~';
		}
	},
	{
		key: 'formatting-italic',
		label: 'Italic',
		classList: ['italic'],
		handler: (text: string): string => {
			return '*' + (text.length ? text : 'Italic') + '*';
		}
	}
];

export const MarkdownControlList = (): MarkdownControl[] => [
	{
		key: 'list-default',
		label: 'Unordered',
		handler: (text: string): string => {
			return text.length ? '\n- ' + text : '\n- List \n';
		}
	},
	{
		key: 'list-ordered',
		label: 'Ordered',
		handler: (text: string): string => {
			return text.length ? '\n1. ' + text : '\n1. Ordered List \n';
		}
	}
];

export const MarkdownControlUrl = (): MarkdownControl[] => [
	{
		key: 'url-link',
		label: 'Link',
		icon: 'link',
		handler: (text: string, url: string): string => {
			return text.length
				? `[${text}](${url})`
				: `[Enter link description here](${url})`;
		}
	},
	{
		key: 'url-image',
		label: 'Image',
		icon: 'image',
		handler: (text: string, url: string): string => {
			return text.length
				? `\n![${text}](${url})\n`
				: `\n![Enter image description here](${url})\n`;
		}
	},
	{
		key: 'url-gist',
		label: 'Gist',
		icon: 'github',
		handler: (url: string): string => {
			return `\n@[Github](${url})\n`;
		}
	},
	{
		key: 'url-youtube',
		label: 'Youtube',
		icon: 'youtube',
		handler: (url: string): string => {
			return `\n@[Youtube](${url})\n`;
		}
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
