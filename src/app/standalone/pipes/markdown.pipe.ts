/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';
import MarkdownIt from 'markdown-it';

@Pipe({
	standalone: true,
	name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	markdownIt: MarkdownIt;

	transform(value: string, type?: string): string {
		this.markdownIt = this.markdownService.getMarkdownIt();

		const htmlText: string = this.markdownIt.render(value);

		if (type === 'time-to-read') {
			// @ts-ignore
			// prettier-ignore
			const plainText: string = this.markdownIt.plainText.replace(/<\/?[a-z][a-z0-9]*[^<>]*>|<!--.*?-->/gim, '');

			const timeToRead = (): number => {
				const wordsPerMinute: number = 225;
				const words: number = plainText.trim().split(/\s+/).length;

				return Math.ceil(words / wordsPerMinute);
			};

			return String(timeToRead());
		}

		return htmlText;
	}
}
