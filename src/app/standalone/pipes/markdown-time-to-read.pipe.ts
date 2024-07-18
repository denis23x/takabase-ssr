/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	standalone: true,
	name: 'markdownTimeToRead'
})
export class MarkdownTimeToReadPipe implements PipeTransform {
	transform(value: string): string {
		const wordsPerMinute: number = 200;
		const wordsCount: number = this.getStripMarkdown(value).trim().split(/\s+/).length;

		return String(Math.ceil(wordsCount / wordsPerMinute));
	}

	getStripMarkdown(markdown: string): string {
		// Remove code blocks
		// markdown = markdown.replace(/```[\s\S]*?```/g, '');

		// Remove inline code
		// markdown = markdown.replace(/`[^`]*`/g, '');

		// Remove images
		markdown = markdown.replace(/!\[.*?\]\(.*?\)/g, '');

		// Remove links
		markdown = markdown.replace(/\[.*?\]\(.*?\)/g, '');

		// Remove blockquotes
		markdown = markdown.replace(/^>.*$/gm, '');

		// Remove headings
		markdown = markdown.replace(/^#+\s/gm, '');

		// Remove horizontal rules
		markdown = markdown.replace(/^---$/gm, '');

		// Remove bold
		markdown = markdown.replace(/(\*\*|__)(.*?)\1/g, '$2');

		// Remove italic
		markdown = markdown.replace(/(\*|_)(.*?)\1/g, '$2');

		// Remove strikethrough
		markdown = markdown.replace(/~~(.*?)~~/g, '$1');

		// Remove unordered list markers
		markdown = markdown.replace(/^[\*\-\+]\s/gm, '');

		// Remove ordered list markers
		markdown = markdown.replace(/^\d+\.\s/gm, '');

		// Remove extra spaces and newlines
		markdown = markdown.replace(/\s+/g, ' ').trim();

		return markdown;
	}
}
