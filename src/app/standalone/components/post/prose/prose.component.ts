/** @format */

import { Component, ComponentRef, inject, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { AdComponent } from '../../ad/ad.component';
import { CopyToClipboardDirective } from '../../../directives/app-copy-to-clipboard.directive';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { HelperService } from '../../../../core/services/helper.service';
import { MarkdownRenderDirective } from '../../../directives/app-markdown-render.directive';
import { MarkdownTimeToReadPipe } from '../../../pipes/markdown-time-to-read.pipe';
import { FireStoragePipe } from '../../../pipes/fire-storage.pipe';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
import type { QRCodeComponent } from '../../qr-code/qr-code.component';
import type { PostDeleteComponent } from '../delete/delete.component';
import type { ReportComponent } from '../../report/report.component';
import type { Post } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		DayjsPipe,
		NgOptimizedImage,
		SkeletonDirective,
		DropdownComponent,
		SvgIconComponent,
		AdComponent,
		CopyToClipboardDirective,
		MarkdownRenderDirective,
		MarkdownTimeToReadPipe,
		FireStoragePipe
	],
	providers: [MarkdownService],
	selector: 'app-post-prose, [appPostProse]',
	templateUrl: './prose.component.html'
})
export class PostProseComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	@Input({ required: true })
	set appPostProsePost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPostProsePostType(postType: string) {
		this.postType = postType;
	}

	@Input()
	set appPostProsePreview(postPreview: boolean) {
		this.postPreview = postPreview;
	}

	@Input()
	set appPostProsePostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	post: Post | undefined;
	postType: string = 'category';
	postPreview: boolean = false;
	postShareUrl: string | undefined;
	postSkeletonToggle: boolean = true;

	// Lazy loading

	appPostDeleteComponent: ComponentRef<PostDeleteComponent>;
	appQRCodeComponent: ComponentRef<QRCodeComponent>;
	appReportComponent: ComponentRef<ReportComponent>;

	ngOnInit(): void {
		super.ngOnInit();

		// Get current url
		this.postShareUrl = this.helperService.getURL().toString();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	/** LAZY */

	async onToggleReportDialog(): Promise<void> {
		if (this.currentUser) {
			if (!this.appReportComponent) {
				await import('../../report/report.component')
					.then(m => (this.appReportComponent = this.viewContainerRef.createComponent(m.ReportComponent)))
					.catch((error: any) => console.error(error));
			}

			this.appReportComponent.setInput('appReportPost', this.post);

			this.appReportComponent.changeDetectorRef.detectChanges();
			this.appReportComponent.instance.onToggleReportDialog(true);
		} else {
			this.snackbarService.warning('Nope', 'Log in before reporting');
		}
	}

	async onToggleQRCodeDialog(): Promise<void> {
		if (!this.appQRCodeComponent) {
			await import('../../qr-code/qr-code.component')
				.then(m => (this.appQRCodeComponent = this.viewContainerRef.createComponent(m.QRCodeComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appQRCodeComponent.setInput('appQRCodeData', this.postShareUrl);
		this.appQRCodeComponent.setInput('appQRCodeOrigin', false);

		this.appQRCodeComponent.changeDetectorRef.detectChanges();
		this.appQRCodeComponent.instance.onToggleQRCodeDialog(true);
	}

	async onTogglePostDeleteDialog(): Promise<void> {
		if (!this.appPostDeleteComponent) {
			await import('../delete/delete.component')
				.then(m => (this.appPostDeleteComponent = this.viewContainerRef.createComponent(m.PostDeleteComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appPostDeleteComponent.setInput('appPostDeletePost', this.post);
		this.appPostDeleteComponent.setInput('appPostDeletePostType', this.postType);

		this.appPostDeleteComponent.changeDetectorRef.detectChanges();
		this.appPostDeleteComponent.instance.onTogglePostDeleteDialog(true);
	}
}
