/** @format */

import { Component, ComponentRef, inject, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { filter } from 'rxjs/operators';
import { AdComponent } from '../../ad/ad.component';
import { CopyToClipboardDirective } from '../../../directives/app-copy-to-clipboard.directive';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { HelperService } from '../../../../core/services/helper.service';
import { MarkdownRenderDirective } from '../../../directives/app-markdown-render.directive';
import { MarkdownTimeToReadPipe } from '../../../pipes/markdown-time-to-read.pipe';
import { FireStoragePipe } from '../../../pipes/fire-storage.pipe';
import { MarkdownService } from '../../../../core/services/markdown.service';
import type { QRCodeComponent } from '../../qr-code/qr-code.component';
import type { PostDeleteComponent } from '../delete/delete.component';
import type { ReportComponent } from '../../report/report.component';
import type { Post } from '../../../../core/models/post.model';
import type { CurrentUser } from '../../../../core/models/current-user.model';

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
export class PostProseComponent implements OnInit, OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
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

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	post: Post | undefined;
	postType: string | undefined;
	postPreview: boolean = false;
	postShareUrl: string | undefined;
	postSkeletonToggle: boolean = true;

	// Lazy loading

	appPostDeleteComponent: ComponentRef<PostDeleteComponent>;
	appQRCodeComponent: ComponentRef<QRCodeComponent>;
	appReportComponent: ComponentRef<ReportComponent>;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});

		// Get current url
		this.postShareUrl = this.helperService.getURL().toString();
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	/** LAZY */

	async onToggleReportDialog(): Promise<void> {
		if (this.currentUser) {
			if (!this.appReportComponent) {
				const reportComponent: Type<ReportComponent> = await import('../../report/report.component').then(m => {
					return m.ReportComponent;
				});

				this.appReportComponent = this.viewContainerRef.createComponent(reportComponent);
				this.appReportComponent.setInput('appReportPost', this.post);
			}

			this.appReportComponent.changeDetectorRef.detectChanges();
			this.appReportComponent.instance.onToggleReportDialog(true);
		} else {
			this.snackbarService.warning('Nope', 'Log in before reporting');
		}
	}

	async onToggleQRCodeDialog(): Promise<void> {
		if (!this.appQRCodeComponent) {
			const qrCodeComponent: Type<QRCodeComponent> = await import('../../qr-code/qr-code.component').then(m => {
				return m.QRCodeComponent;
			});

			this.appQRCodeComponent = this.viewContainerRef.createComponent(qrCodeComponent);
			this.appQRCodeComponent.setInput('appQRCodeData', this.postShareUrl);
			this.appQRCodeComponent.setInput('appQRCodeOrigin', false);
		}

		this.appQRCodeComponent.changeDetectorRef.detectChanges();
		this.appQRCodeComponent.instance.onToggleQRCodeDialog(true);
	}

	async onTogglePostDeleteDialog(): Promise<void> {
		if (!this.appPostDeleteComponent) {
			const postDeleteComponent: Type<PostDeleteComponent> = await import('../delete/delete.component').then(m => {
				return m.PostDeleteComponent;
			});

			this.appPostDeleteComponent = this.viewContainerRef.createComponent(postDeleteComponent);
			this.appPostDeleteComponent.setInput('appPostDeletePost', this.post);
		}

		this.appPostDeleteComponent.changeDetectorRef.detectChanges();
		this.appPostDeleteComponent.instance.onTogglePostDeleteDialog(true);
	}
}
