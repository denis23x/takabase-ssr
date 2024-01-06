/** @format */

import { Component } from '@angular/core';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { AbstractMarkdownProseComponent } from '../../abstracts/abstract-markdown-prose.component';
import { CommonModule } from '@angular/common';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';

@Component({
	standalone: true,
	imports: [CommonModule, MarkdownPipe, SanitizerPipe, SkeletonDirective],
	selector: 'app-terms-details',
	templateUrl: './details.component.html'
})
export class TermsDetailsComponent extends AbstractMarkdownProseComponent {
	getAbstractProseUrl(markdown: string): string {
		return '/assets/markdown/terms/' + markdown + '.md';
	}
}
