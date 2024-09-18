/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';

@Pipe({
	standalone: true,
	name: 'markdownTags'
})
export class MarkdownTagsPipe implements PipeTransform {
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	transform(value: string, tagsLimit: number = 10): string[] {
		return this.markdownService.getMarkdownItTags(this.markdownService.getMarkdownItRawText(value), tagsLimit);
	}
}
