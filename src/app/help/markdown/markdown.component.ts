/** @format */

import { Component } from '@angular/core';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { TextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { RouterModule } from '@angular/router';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		MarkdownPipe,
		SanitizerPipe,
		FormsModule,
		SvgIconComponent,
		TextareaAutosizeDirective
	],
	selector: 'app-help-markdown',
	templateUrl: './markdown.component.html'
})
export class HelpMarkdownComponent {
	// prettier-ignore
	markdownBasicSyntax: any[] = [
    {
      title: 'Headings',
      description: 'To create a heading, add number signs <code>#</code> in front of a word or phrase. The number of number signs you use should correspond to the heading level. For example, to create a heading level three <code>&lt;h3&gt;</code>, use three number signs <code>e.g., ### My Header</code>',
      markdown: `# Heading 1\n\n## Heading 2\n\n### Heading 3\n\n#### Heading 4`
    },
    {
      title: 'Emphasis',
      description: 'You can add emphasis by making text bold or italic. To italicize text, add one asterisk or underscore before and after a word or phrase. To italicize the middle of a word for emphasis, add one asterisk without spaces around the letters.',
      markdown: `**Bold**\n\n~~Strikethrough~~\n\n*Italic*\n\n==Mark==\n\nLorem ipsum dolor sit amet, ***consectetur*** adipiscing elit, sed do eiusmod tempor ~~incididunt ut labore et dolore~~ magna aliqua.`,
    },
    {
      title: 'Lists',
      description: 'You can organize items into ordered and unordered lists. To create an ordered list, add line items with numbers followed by periods. The numbers don’t have to be in numerical order, but the list should start with the number one. To create an unordered list, add dashes <code>-</code>, asterisks <code>*</code>, or plus signs <code>+</code> in front of line items. Indent one or more items to create a nested list',
      markdown: `1. Ordered list\n    1. Ordered list\n    2. Ordered list\n        1. Ordered list\n2. Ordered list\n\n---\n\n- Unordered list\n    - Unordered list\n    - Unordered list\n        - Unordered list\n- Unordered list`
    },
    {
      title: 'Links',
      description: 'To create a link, enclose the link text in brackets <code>e.g., [Takabase]</code> and then follow it immediately with the URL in parentheses <code>e.g., (https://takabase.com)</code>. You can optionally add a title for a link. This will appear as a tooltip when the user hovers over the link. To add a title, enclose it in quotation marks after the URL',
      markdown: `My favorite website is [Takabase App](https://takabase.com "The best website")`
    },
    {
      title: 'Blockquotes',
      description: 'To create a blockquote, add a <code>></code> in front of a paragraph. Blockquotes can be nested. Add a <code>>></code> in front of the paragraph you want to nest',
      markdown: `> Dorothy followed her through many of the beautiful rooms in her castle\n\n---\n\n> Dorothy followed her through many of the beautiful rooms in her castle\n>\n>> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood`
    },
    {
      title: 'Code',
      description: 'To denote a word or phrase as code, enclose it in backticks <code>`</code>.  The Markdown syntax allows you to create fenced code blocks. You should use three backticks <code>```</code> on the lines before and after the code block',
      markdown: `\`<inline-code/>\`\n\n\`\`\` typescript\n// TODO: remake\nconst name: string = 'Takabase';\n\`\`\``
    },
    {
      title: 'Images',
      description: 'To add an image, add an exclamation mark <code>!</code>, followed by alt text in brackets, and the path or URL to the image asset in parentheses. You can optionally add a title in quotation marks after the path or URL',
      markdown: `![Takabase](/assets/images/placeholder-image-meta.png "Image")`
    },
    {
      title: 'Advanced',
      description: 'Add classes, identifiers and attributes to your markdown with <code>{.class .class2 attr=value}</code> curly brackets. Feel free to show your imagination and use the large set of CSS classes available in the style safe list section',
      markdown: `![Takabase](/assets/images/placeholder-image-meta.png "Image"){.mask .mask-heart width=100}\n\n[Takabase App](https://takabase.com){.link .link-info}\n\nBadge Primary{.badge .badge-primary}\n\n[Secondary]{.btn .btn-secondary .btn-outline}\n\n- Register{.step .step-primary}\n- Choose plan{.step .step-primary}\n- Purchase{.step}\n{.steps .steps-vertical .not-prose .p-0}`
    }
  ];
}
