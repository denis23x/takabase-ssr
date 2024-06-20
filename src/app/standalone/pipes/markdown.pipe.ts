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

		switch (type) {
			case 'time-to-read': {
				// @ts-ignore
				const plainText: string = this.markdownIt.plainText.replace(/<\/?[a-z][a-z0-9]*[^<>]*>|<!--.*?-->/gim, '');

				const timeToRead = (): number => {
					const wordsPerMinute: number = 225;
					const wordsCount: number = plainText.trim().split(/\s+/).length;

					return Math.ceil(wordsCount / wordsPerMinute);
				};

				return String(timeToRead());
			}
			default: {
				return this.markdownIt.render(value);
			}
		}
	}
}
