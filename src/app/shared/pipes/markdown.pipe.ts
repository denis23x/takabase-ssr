/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { MarkdownService } from '../../core';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  constructor(private markdownService: MarkdownService) {}

  transform(value: string, element: HTMLElement): void {
    this.markdownService.getRender(value, element);
  }
}
