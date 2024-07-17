/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';
import { PlatformService } from '../../core/services/platform.service';
import type MarkdownIt from 'markdown-it';

@Pipe({
	standalone: true,
	name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly markdownService: MarkdownService = inject(MarkdownService);

	transform(value: string): string {
		if (this.platformService.isBrowser()) {
			this.markdownService.getMarkdownIt(value).then((markdownIt: MarkdownIt) => markdownIt.render(value));
		}

		return this.markdownService.getMarkdownItDefault().render(value);
	}
}
