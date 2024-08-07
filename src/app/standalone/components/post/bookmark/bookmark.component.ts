/** @format */

import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PostBookmarkService } from '../../../../core/services/post-bookmark.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { filter } from 'rxjs/operators';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import type { Post } from '../../../../core/models/post.model';
import type { PostBookmarkCreateDto } from '../../../../core/dto/post-bookmark/post-bookmark-create.dto';
import type { PostBookmarkGetOneDto } from '../../../../core/dto/post-bookmark/post-bookmark-get-one.dto';
import type { PostBookmark } from '../../../../core/models/post-bookmark.model';

@Component({
	standalone: true,
	selector: 'app-post-bookmark, [appPostBookmark]',
	imports: [RouterModule, CommonModule, SvgIconComponent, SkeletonDirective],
	providers: [PostBookmarkService],
	templateUrl: './bookmark.component.html'
})
export class BookmarkComponent implements OnInit, OnDestroy {
	private readonly postBookmarkService: PostBookmarkService = inject(PostBookmarkService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@Input()
	set appPostBookmarkPost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPostBookmarkPostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggleSubject$.next(postSkeletonToggle);
	}

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	post: Post | undefined;
	postSkeletonToggleSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	postSkeletonToggle$: Subscription | undefined;

	postBookmark: PostBookmark | undefined;
	postBookmarkRequest$: Subscription | undefined;
	postBookmarkIsLoading: boolean = false;
	postBookmarkSkeletonToggle: boolean = true;

	ngOnInit(): void {
		this.postSkeletonToggle$?.unsubscribe();
		this.postSkeletonToggle$ = this.postSkeletonToggleSubject$
			.pipe(filter((postSkeletonToggle: boolean) => !postSkeletonToggle))
			.subscribe({
				next: () => this.setResolver(),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.postSkeletonToggle$, this.postBookmarkRequest$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.currentUserSkeletonToggle$?.unsubscribe();
			this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
				.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
				.subscribe({
					next: () => {
						const postBookmarkId: number = this.post.id;
						const postBookmarkGetOneDto: PostBookmarkGetOneDto = {
							attachPost: false
						};

						this.postBookmarkRequest$?.unsubscribe();
						this.postBookmarkRequest$ = this.postBookmarkService
							.getOne(postBookmarkId, postBookmarkGetOneDto)
							.subscribe({
								next: (postBookmark: PostBookmark | Post | null) => {
									this.postBookmark = postBookmark as PostBookmark;
									this.postBookmarkSkeletonToggle = false;
								},
								error: (error: any) => console.error(error)
							});
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	onClick(): void {
		if (this.postBookmark) {
			this.onDeleteClick();
		} else {
			this.onCreateClick();
		}

		// Set loader

		this.postBookmarkIsLoading = true;
	}

	onCreateClick(): void {
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
			error: (error: any) => console.error(error)
		});
	}

	onDeleteClick(): void {
		this.postBookmarkRequest$?.unsubscribe();
		this.postBookmarkRequest$ = this.postBookmarkService.delete(this.post.id).subscribe({
			next: () => {
				this.postBookmark = undefined;
				this.postBookmarkIsLoading = false;

				this.snackbarService.warning('Oh.. ok', 'Removed from your bookmarks');
			},
			error: (error: any) => console.error(error)
		});
	}
}
