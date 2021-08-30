/** @format */

import { MarkdownControl } from '../models';

export const MarkdownControlList = (): MarkdownControl[] => [
  {
    key: 'heading-h1',
    label: 'H1',
    icon: 'type-h1',
    handler: (text: string): string => {
      return '\n# ' + (text.length ? text + '\n' : 'H1 ');
    }
  },
  {
    key: 'heading-h2',
    label: 'H2',
    icon: 'type-h2',
    handler: (text: string): string => {
      return '\n## ' + (text.length ? text + '\n' : 'H2 ');
    }
  },
  {
    key: 'heading-h3',
    label: 'H3',
    icon: 'type-h3',
    handler: (text: string): string => {
      return '\n### ' + (text.length ? text + '\n' : 'H3 ');
    }
  },
  {
    key: 'text-bold',
    label: 'Bold',
    icon: 'type-bold',
    handler: (text: string): string => {
      return '**' + (text.length ? text : 'Bold') + '**';
    }
  },
  {
    key: 'text-strikethrough',
    label: 'Strikethrough',
    icon: 'type-strikethrough',
    handler: (text: string): string => {
      return '~~' + (text.length ? text : 'Strikethrough') + '~~';
    }
  },
  {
    key: 'list-default',
    label: 'List',
    icon: 'list-ul',
    handler: (text: string): string => {
      return text.length ? '\n- ' + text : '\n- List \n';
    }
  },
  {
    key: 'list-ordered',
    label: 'Ordered list',
    icon: 'list-ol',
    handler: (text: string): string => {
      return text.length ? '\n1. ' + text : '\n1. Ordered List \n';
    }
  },
  {
    key: 'url-link',
    label: 'Link',
    icon: 'link',
    handler: (text: string, url: string): string => {
      return text.length ? `[${text}](${url})` : `[Enter link description here](${url})`;
    }
  },
  {
    key: 'url-image',
    label: 'Image',
    icon: 'image',
    handler: (text: string, url: string): string => {
      return text.length ? `\n![${text}](${url})\n` : `\n![Enter image description here](${url})\n`;
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
  },
  {
    key: 'text-hr',
    label: 'Horizontal Rule',
    icon: 'hr',
    handler: (): string => {
      return '\n\n---\n\n';
    }
  },
  {
    key: 'text-code',
    label: 'Code',
    icon: 'code-slash',
    handler: (selection: string): string => {
      return '\n``` language\n' + (selection.length ? selection : 'Enter code here') + '\n```\n';
    }
  }
];
