/** @format */

import { Component } from '@angular/core';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { AbstractMarkdownComponent } from '../../abstracts/abstract-markdown.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	imports: [MarkdownPipe, CommonModule, SanitizerPipe, SkeletonDirective],
	selector: 'app-terms-details',
	templateUrl: './details.component.html'
})
export class TermsDetailsComponent extends AbstractMarkdownComponent {
	getAbstractProseUrl(markdown: string): string {
		return '/assets/markdown/terms/' + markdown + '.md';
	}
}
