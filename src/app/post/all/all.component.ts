/** @format */

import { Component, ComponentRef, inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ShareComponent } from '../../standalone/components/share/share.component';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PlatformService } from '../../core/services/platform.service';
import { ApiService } from '../../core/services/api.service';
import { PostStore } from '../post.store';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { PostBookmarkService } from '../../core/services/post-bookmark.service';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import type { Post } from '../../core/models/post.model';
import type { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import type { HttpErrorResponse } from '@angular/common/http';
import type { ReportComponent } from '../../standalone/components/report/report.component';
import type { PostBookmark } from '../../core/models/post-bookmark.model';
import type { PostBookmarkCreateDto } from '../../core/dto/post-bookmark/post-bookmark-create.dto';
import type { PostBookmarkGetOneDto } from '../../core/dto/post-bookmark/post-bookmark-get-one.dto';

@Component({
	standalone: true,
	imports: [CommonModule, PostProseComponent, ShareComponent, SkeletonDirective, SvgIconComponent, AdComponent],
	providers: [PostService, PostBookmarkService],
	selector: 'app-post-all',
	templateUrl: './all.component.html'
})
export class PostAllComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly postService: PostService = inject(PostService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly postBookmarkService: PostBookmarkService = inject(PostBookmarkService);

	post: Post | undefined;
	postRequest$: Subscription | undefined;
	postSkeletonToggle: boolean = true;

	postBookmark: PostBookmark | undefined;
	postBookmarkRequest$: Subscription | undefined;
	postBookmarkIsLoading: boolean = false;

	// Lazy loading

	appReportComponent: ComponentRef<ReportComponent>;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.postRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	ngOnCurrentUserIsReady(): void {
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

	setSkeleton(): void {
		this.post = this.skeletonService.getPost(['category', 'user']);
		this.postSkeletonToggle = true;
	}

	setResolver(): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postGetOneDto: PostGetOneDto = {
			scope: ['user', 'category']
		};

		this.postRequest$?.unsubscribe();
		this.postRequest$ = this.postService
			.getOne(postId, postGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					/** Set Transfer State */

					if (this.platformService.isServer()) {
						this.apiService.setHttpErrorResponseKey(httpErrorResponse);
					}

					const redirect$: Promise<boolean> = this.router.navigate(['/error', httpErrorResponse.status], {
						skipLocationChange: true
					});

					return from(redirect$).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				}),
				tap((post: Post) => this.postStore.setPost(post))
			)
			.subscribe({
				next: (post: Post) => {
					this.post = post;
					this.postSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});
	}

	/** Bookmark */

	onToggleBookmark(): void {
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

	async onToggleReportDialog(): Promise<void> {
		if (this.currentUser) {
			if (!this.appReportComponent) {
				await import('../../standalone/components/report/report.component')
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
}
