/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';

@Pipe({
	standalone: true,
	name: 'markdownTimeToRead'
})
export class MarkdownTimeToReadPipe implements PipeTransform {
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	transform(value: string): string {
		const wordsPerMinute: number = 200;
		const wordsCount: number = this.markdownService.getMarkdownItStripText(value).trim().split(/\s+/).length;

		return String(Math.ceil(wordsCount / wordsPerMinute));
	}
}
