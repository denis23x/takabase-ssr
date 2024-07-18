/** @format */

import { Component } from '@angular/core';
import { AbstractMarkdownComponent } from '../../abstracts/abstract-markdown.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { MarkdownRenderDirective } from '../../standalone/directives/app-markdown-render.directive';

@Component({
	standalone: true,
	imports: [SkeletonDirective, MarkdownRenderDirective],
	selector: 'app-help-details',
	templateUrl: './details.component.html'
})
export class HelpDetailsComponent extends AbstractMarkdownComponent {
	getAbstractProseUrl(markdown: string): string {
		return '/assets/markdown/help/' + markdown + '.md';
	}
}
