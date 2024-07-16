/** @format */

import { Component } from '@angular/core';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { AbstractMarkdownComponent } from '../../abstracts/abstract-markdown.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	imports: [CommonModule, MarkdownPipe, SanitizerPipe, SkeletonDirective],
	selector: 'app-help-details',
	templateUrl: './details.component.html'
})
export class HelpDetailsComponent extends AbstractMarkdownComponent {
	getAbstractProseUrl(markdown: string): string {
		return '/assets/markdown/help/' + markdown + '.md';
	}
}
