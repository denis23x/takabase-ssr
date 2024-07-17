/** @format */

import { Component } from '@angular/core';
import { MarkdownLazyPipe } from '../../standalone/pipes/markdown-lazy.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { TextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import helpMarkdown from '../../../assets/json/help-markdown.json';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		MarkdownLazyPipe,
		SanitizerPipe,
		FormsModule,
		SvgIconComponent,
		TextareaAutosizeDirective
	],
	selector: 'app-help-markdown',
	templateUrl: './markdown.component.html'
})
export class HelpMarkdownComponent {
	markdownSyntax: any[] = helpMarkdown;
}
