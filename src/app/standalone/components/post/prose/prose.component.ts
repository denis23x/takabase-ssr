/** @format */

import { Component, ComponentRef, inject, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { HelperService } from '../../../../core/services/helper.service';
import { MarkdownRenderDirective } from '../../../directives/app-markdown-render.directive';
import { MarkdownTimeToReadPipe } from '../../../pipes/markdown-time-to-read.pipe';
import { FirebaseStoragePipe } from '../../../pipes/firebase-storage.pipe';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { filter } from 'rxjs/operators';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
import { AvatarComponent } from '../../avatar/avatar.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Subscription } from 'rxjs';
import { PostBookmarkService } from '../../../../core/services/post-bookmark.service';
import type { QRCodeComponent } from '../../qr-code/qr-code.component';
import type { Post } from '../../../../core/models/post.model';
import type { PostExternalLinkComponent } from '../external-link/external-link.component';
import type { domToCanvas, Options } from 'modern-screenshot';
import type { ReportComponent } from '../../report/report.component';
import type { PostBookmark } from '../../../../core/models/post-bookmark.model';
import type { PostBookmarkCreateDto } from '../../../../core/dto/post-bookmark/post-bookmark-create.dto';
import type { PostBookmarkGetOneDto } from '../../../../core/dto/post-bookmark/post-bookmark-get-one.dto';

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
		MarkdownRenderDirective,
		MarkdownTimeToReadPipe,
		FirebaseStoragePipe,
		AvatarComponent
	],
	providers: [MarkdownService, PostBookmarkService],
	selector: 'app-post-prose, [appPostProse]',
	templateUrl: './prose.component.html'
})
export class PostProseComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly postBookmarkService: PostBookmarkService = inject(PostBookmarkService);

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
	postType: string = 'public';
	postPreview: boolean = false;
	postSkeletonToggle: boolean = true;

	domToCanvas: typeof domToCanvas;
	domToCanvasSelector: string = 'app-post section';
	domToCanvasIsLoading: boolean = false;

	postBookmark: PostBookmark | undefined;
	postBookmarkRequest$: Subscription | undefined;
	postBookmarkIsLoading: boolean = false;

	// Lazy loading

	appQRCodeComponent: ComponentRef<QRCodeComponent>;
	appReportComponent: ComponentRef<ReportComponent>;
	appPostExternalLinkComponent: ComponentRef<PostExternalLinkComponent>;

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.postBookmarkRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	ngOnCurrentUserIsReady(): void {
		if (!this.postPreview) {
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postBookmarkGetOneDto: PostBookmarkGetOneDto = {
				attachPost: false
			};

			this.postBookmarkRequest$?.unsubscribe();
			this.postBookmarkRequest$ = this.postBookmarkService.getOne(postId, postBookmarkGetOneDto).subscribe({
				next: (postBookmark: PostBookmark | Post | null) => (this.postBookmark = postBookmark as PostBookmark),
				error: (error: any) => console.error(error)
			});
		}
	}

	onClickBookmark(): void {
		if (this.currentUser) {
			// Set loader

			this.postBookmarkIsLoading = true;

			// Do request

			if (this.postBookmark) {
				this.postBookmarkRequest$?.unsubscribe();
				this.postBookmarkRequest$ = this.postBookmarkService.delete(this.post.id).subscribe({
					next: () => {
						this.postBookmark = undefined;
						this.postBookmarkIsLoading = false;

						this.snackbarService.warning('Oh.. ok', 'Removed from your bookmarks');
					},
					error: () => (this.postBookmarkIsLoading = false)
				});
			} else {
				this.postBookmarkIsLoading = true;

				const postBookmarkCreateDto: PostBookmarkCreateDto = {
					postId: this.post.id
				};

				this.postBookmarkRequest$?.unsubscribe();
				this.postBookmarkRequest$ = this.postBookmarkService.create(postBookmarkCreateDto).subscribe({
					next: (postBookmark: PostBookmark) => {
						this.postBookmark = postBookmark;
						this.postBookmarkIsLoading = false;

						this.snackbarService.success('Good choice!', 'Added to your bookmarks');
					},
					error: () => (this.postBookmarkIsLoading = false)
				});
			}
		} else {
			this.snackbarService.warning('Nope', 'Log in before add to bookmarks');
		}
	}

	/** LAZY */

	async onClickDomToCanvas(): Promise<void> {
		if (!this.domToCanvas) {
			await import('modern-screenshot')
				.then(m => (this.domToCanvas = m.domToCanvas))
				.catch((error: any) => console.error(error));
		}

		const htmlElement: HTMLElement = this.document.querySelector(this.domToCanvasSelector);
		const htmlElementOptions: Options = {
			type: 'image/png',
			scale: 2,
			filter: (node: Node): boolean => true
		};

		this.domToCanvasIsLoading = true;
		this.domToCanvas(htmlElement, htmlElementOptions)
			.then((canvas: HTMLCanvasElement) => {
				const fileName: string = ['screenshot', this.post.id].join('-');

				if (this.platformService.isMobile()) {
					canvas.toBlob((blob: Blob) => {
						const shareFile: File = this.helperService.getFileFromBlob(blob, fileName);
						const shareData: ShareData = {
							files: [shareFile]
						};

						if (this.platformService.isCanShare(shareData)) {
							navigator
								.share(shareData)
								.then(() => console.debug('Shared through native share'))
								.catch((error: any) => console.error(error));
						}
					});
				} else {
					this.helperService.setDownload(canvas.toDataURL('image/png'), fileName);
				}
			})
			.catch((error: any) => error)
			.finally(() => (this.domToCanvasIsLoading = false));
	}

	async onToggleQRCodeDialog(): Promise<void> {
		if (!this.appQRCodeComponent) {
			await import('../../qr-code/qr-code.component')
				.then(m => (this.appQRCodeComponent = this.viewContainerRef.createComponent(m.QRCodeComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appQRCodeComponent.setInput('appQRCodeData', this.helperService.getURL().toString());

		this.appQRCodeComponent.changeDetectorRef.detectChanges();
		this.appQRCodeComponent.instance.onToggleQRCodeDialog(true);
	}

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

	async onTogglePostExternalLinkDialog(href: string): Promise<void> {
		if (!this.appPostExternalLinkComponent) {
			await import('../../post/external-link/external-link.component')
				.then(m => {
					this.appPostExternalLinkComponent = this.viewContainerRef.createComponent(m.PostExternalLinkComponent);
					this.appPostExternalLinkComponent.instance.appPostExternalLinkSubmit
						.pipe(filter(() => this.postType === 'public'))
						.subscribe({
							next: () => this.platformService.getWindow().open(href, '_blank'),
							error: (error: any) => console.error(error)
						});
				})
				.catch((error: any) => console.error(error));
		}

		this.appPostExternalLinkComponent.changeDetectorRef.detectChanges();
		this.appPostExternalLinkComponent.instance.onTogglePostExternalLinkDialog(true);
	}
}
