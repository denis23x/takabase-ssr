/** @format */

import { Component } from '@angular/core';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { FormsModule } from '@angular/forms';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { TextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownRenderDirective } from '../../standalone/directives/app-markdown-render.directive';
import helpMarkdown from '../../../assets/json/help-markdown.json';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		SanitizerPipe,
		FormsModule,
		SvgIconComponent,
		TextareaAutosizeDirective,
		MarkdownRenderDirective
	],
	selector: 'app-help-markdown',
	templateUrl: './markdown.component.html'
})
export class HelpMarkdownComponent {
	markdownSyntax: any[] = helpMarkdown;
}
