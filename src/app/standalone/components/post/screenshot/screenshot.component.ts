/** @format */

import { Component, inject, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { domToCanvas } from 'modern-screenshot';
import { HelperService } from '../../../../core/services/helper.service';
import { DOCUMENT } from '@angular/common';
import type { Options } from 'modern-screenshot';

@Component({
	standalone: true,
	selector: 'app-post-screenshot, [appPostScreenshot]',
	imports: [SkeletonDirective, SvgIconComponent],
	templateUrl: './screenshot.component.html'
})
export class PostScreenshotComponent {
	private readonly document: Document = inject(DOCUMENT);
	private readonly helperService: HelperService = inject(HelperService);

	@Input()
	set appScreenshotSkeletonToggle(screenshotSkeletonToggle: boolean) {
		this.screenshotSkeletonToggle = screenshotSkeletonToggle;
	}

	screenshotSelector: string = 'app-post section';
	screenshotIsLoading: boolean = false;
	screenshotSkeletonToggle: boolean = true;

	onClick(): void {
		const htmlElement: HTMLElement = this.document.querySelector(this.screenshotSelector);
		const htmlElementOptions: Options = {
			font: false,
			filter: (node: Node): boolean => true
		};

		this.screenshotIsLoading = true;

		domToCanvas(htmlElement, htmlElementOptions)
			.then((htmlCanvasElement: HTMLCanvasElement) => {
				const dataURL: string = htmlCanvasElement.toDataURL('image/png');
				const fileName: string = 'snapshot.png';

				// TODO: download AND share
				this.helperService.setDownload(dataURL, fileName);
			})
			.catch((error: any) => error)
			.finally(() => (this.screenshotIsLoading = false));
	}
}
