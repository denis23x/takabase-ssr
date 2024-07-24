/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { MarkdownRenderDirective } from '../../standalone/directives/app-markdown-render.directive';
import { MarkdownMixin as MD } from '../../core/mixins/markdown.mixin';

@Component({
	standalone: true,
	imports: [SkeletonDirective, MarkdownRenderDirective],
	selector: 'app-terms-details',
	templateUrl: './details.component.html'
})
export class TermsDetailsComponent extends MD(class {}) implements OnInit, OnDestroy {
	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	getMarkdownProseUrl(markdown: string): string {
		return '/assets/markdown/terms/' + markdown + '.md';
	}
}
