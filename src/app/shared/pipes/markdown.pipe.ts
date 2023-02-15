/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';

@Pipe({
	standalone: true,
	name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
	constructor(private markdownService: MarkdownService) {}

	transform(value: string, element: HTMLElement): void {
		this.markdownService.getRender(value, element);
	}
}
