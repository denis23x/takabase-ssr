/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';

@Pipe({
	standalone: true,
	name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	transform(value: string): string {
		return this.markdownService.getMarkdownItDefault().render(value);
	}
}
