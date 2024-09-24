/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';

@Pipe({
	standalone: true,
	name: 'markdownTimeToRead'
})
export class MarkdownTimeToReadPipe implements PipeTransform {
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	transform(value: string): number {
		const wordsPerMinute: number = 200;
		const wordsCount: number = this.markdownService.getMarkdownItRawText(value).trim().split(/\s+/).length;

		return Math.ceil(wordsCount / wordsPerMinute);
	}
}
