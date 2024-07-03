/** @format */

import { Component, inject, Input, numberAttribute, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { CurrentUser } from '../../core/models/current-user.model';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { Post } from '../../core/models/post.model';
import { AuthorizationService } from '../../core/services/authorization.service';
import { CookiesService } from '../../core/services/cookies.service';
import { AppearanceService } from '../../core/services/appearance.service';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		AsyncPipe,
		CardPostComponent
	],
	selector: 'app-user-private',
	templateUrl: './private.component.html'
})
export class UserPrivateComponent implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);

	@Input({ transform: numberAttribute })
	set deleteId(deleteId: number | undefined) {
		if (deleteId) {
			this.router
				.navigate([], {
					queryParams: {
						...this.activatedRoute.snapshot.queryParams,
						deleteId: null
					},
					queryParamsHandling: 'merge',
					relativeTo: this.activatedRoute,
					replaceUrl: true
				})
				.then(() => (this.postList = this.postList.filter((post: Post) => post.id !== deleteId)));
		}
	}

	activatedRouteParamsUsername$: Subscription | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;
	postListIsHasMore: boolean = false;
	postListIsLoading: WritableSignal<boolean> = signal(false);
	postListPageScrollInfinite: boolean = false;
	postListPageScrollInfinite$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
		this.activatedRouteParamsUsername$?.unsubscribe();
		this.activatedRouteParamsUsername$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('username'))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});

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

		/** Apply appearance settings */

		this.setAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteParamsUsername$,
			this.currentUser$,
			this.currentUserSkeletonToggle$,
			this.postListRequest$,
			this.postListPageScrollInfinite$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
		this.postListIsHasMore = false;
	}

	setResolver(): void {
		this.getPostList();
	}

	setAppearance(): void {
		this.postListPageScrollInfinite = !!Number(this.cookiesService.getItem('page-scroll-infinite'));

		if (this.postListPageScrollInfinite) {
			this.postListPageScrollInfinite$?.unsubscribe();
			this.postListPageScrollInfinite$ = this.appearanceService
				.getPageScrollInfinite()
				.pipe(filter(() => this.postListIsHasMore && !this.postListIsLoading()))
				.subscribe({
					next: () => this.getPostList(true),
					error: (error: any) => console.error(error)
				});
		}
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postList = [];
		this.postListSkeletonToggle = false;
		this.postListIsHasMore = false;
		this.postListIsLoading.set(false);
	}
}
