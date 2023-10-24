/** @format */

import { Component } from '@angular/core';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { AbstractProseComponent } from '../../abstracts/abstract-prose.component';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	imports: [CommonModule, MarkdownPipe, SanitizerPipe],
	selector: 'app-help-details',
	templateUrl: './details.component.html'
})
export class HelpDetailsComponent extends AbstractProseComponent {
	getAbstractProseUrl(markdown: string): string {
		return '/assets/markdown/help/' + markdown + '.md';
	}
}
