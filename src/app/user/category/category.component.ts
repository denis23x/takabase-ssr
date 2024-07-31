/** @format */

import { Component, ComponentRef, inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription, switchMap } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { HelperService } from '../../core/services/helper.service';
import { UserStore } from '../user.store';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { PostService } from '../../core/services/post.service';
import type { User } from '../../core/models/user.model';
import type { Post } from '../../core/models/post.model';
import type { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import type { Category } from '../../core/models/category.model';
import type { CategoryCreateComponent } from '../../standalone/components/category/create/create.component';
import type { CategoryUpdateComponent } from '../../standalone/components/category/update/update.component';
import type { CategoryDeleteComponent } from '../../standalone/components/category/delete/delete.component';
import type { CategoryDeleteDto } from '../../core/dto/category/category-delete.dto';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		DayjsPipe,
		ScrollPresetDirective,
		SvgIconComponent,
		DropdownComponent,
		SkeletonDirective,
		SearchFormComponent,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	providers: [PostService],
	selector: 'app-user-category',
	templateUrl: './category.component.html'
})
export class UserCategoryComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postService: PostService = inject(PostService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userStore: UserStore = inject(UserStore);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteParamsCategoryId$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	user: User | undefined;
	userSkeletonToggle: boolean = true;

	category: Category | undefined;
	category$: Subscription | undefined;
	categorySkeletonToggle: boolean = true;

	postList: Post[] = [];
	postListSkeletonToggle: boolean = true;
	postListIsLoading: boolean = false;
	postListRequest$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	postListSearchFormToggle: boolean = false;
	postListSearchResponse: any;

	// Lazy loading

	appCategoryCreateComponent: ComponentRef<CategoryCreateComponent>;
	appCategoryUpdateComponent: ComponentRef<CategoryUpdateComponent>;
	appCategoryDeleteComponent: ComponentRef<CategoryDeleteComponent>;

	ngOnInit(): void {
		super.ngOnInit();

		this.activatedRouteParamsUsername$?.unsubscribe();
		this.activatedRouteParamsUsername$ = this.activatedRoute.params
			.pipe(
				distinctUntilKeyChanged('username'),
				switchMap(() => this.userStore.getUser()),
				filter((user: User | undefined) => user?.name === this.activatedRoute.snapshot.paramMap.get('username'))
			)
			.subscribe({
				next: (user: User) => (this.user = user),
				error: (error: any) => console.error(error)
			});

		this.activatedRouteParamsCategoryId$?.unsubscribe();
		this.activatedRouteParamsCategoryId$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('categoryId'))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});

		/** Toggle SearchForm component */

		if (this.activatedRoute.snapshot.queryParamMap.get('query')) {
			this.onToggleSearchForm(true);
		} else {
			this.onToggleSearchForm(false);
		}
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[
			this.activatedRouteParamsUsername$,
			this.activatedRouteParamsCategoryId$,
			this.activatedRouteQueryParams$,
			this.category$,
			this.postListRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.category = this.skeletonService.getCategory();
		this.categorySkeletonToggle = true;

		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
	}

	setResolver(): void {
		this.category$?.unsubscribe();
		this.category$ = this.userStore
			.getCategory()
			.pipe(filter((category: Category | undefined) => !!category))
			.subscribe({
				next: (category: Category) => {
					this.category = category;
					this.categorySkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				distinctUntilKeyChanged('query'),
				tap(() => {
					this.postList = this.skeletonService.getPostList();
					this.postListSkeletonToggle = true;
				})
			)
			.subscribe({
				next: () => this.getPostList(),
				error: (error: any) => console.error(error)
			});
	}

	/** Search */

	onToggleSearchForm(toggle: boolean): void {
		if (toggle) {
			this.postListSearchFormToggle = true;
		} else {
			this.postListSearchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null,
					replaceUrl: true
				})
				.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
		}
	}

	/** Category */

	onCreateCategory(category: Category): void {
		const categoryList: Category[] = this.userStore.categoryList.getValue();

		this.userStore.setCategoryList([category].concat(categoryList));
		this.userStore.setCategory(category);

		// Navigate

		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		this.router
			.navigate(['.', 'category', category.id], navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	onUpdateCategory(categoryUpdate: Category): void {
		const categoryList: Category[] = this.userStore.categoryList
			.getValue()
			.map((category: Category) => (category.id === categoryUpdate.id ? categoryUpdate : category));

		this.userStore.setCategoryList(categoryList);
		this.userStore.setCategory(categoryUpdate);

		// Navigate

		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		this.router
			.navigate(['.', 'category', categoryUpdate.id], navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	onDeleteCategory(categoryDeleteDto: CategoryDeleteDto): void {
		const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
		const categoryList: Category[] = this.userStore.categoryList.getValue();

		this.userStore.setCategoryList(categoryList.filter((category: Category) => category.id !== categoryId));
		this.userStore.setCategory(categoryList.find((category: Category) => category.id === categoryDeleteDto.categoryId));

		// Navigate

		const navigationCommands: string[] = ['.'];
		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		if (categoryDeleteDto.categoryId) {
			navigationCommands.push('category', String(categoryDeleteDto.categoryId));
		}

		this.router
			.navigate(navigationCommands, navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postListIsLoading = true;

		const postPage: number = (this.postListGetAllDto.page = postListLoadMore ? this.postListGetAllDto.page + 1 : 1);
		const postUsername: string = String(this.activatedRoute.snapshot.paramMap.get('username') || '');
		const postCategoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postGetAllDto: PostGetAllDto = {
			...this.postListGetAllDto,
			username: postUsername,
			categoryId: postCategoryId,
			page: postPage
		};

		// Query

		if (postQuery) {
			postGetAllDto.query = postQuery;
		}

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.postList = postGetAllDto.page > 1 ? this.postList.concat(postList) : postList;
				this.postListSkeletonToggle = false;
				this.postListIsLoading = false;
				this.postListSearchResponse = {
					isOnePage: postGetAllDto.page === 1 && postGetAllDto.size !== postList.length,
					isEndPage: postGetAllDto.page !== 1 && postGetAllDto.size !== postList.length
				};
			},
			error: (error: any) => console.error(error)
		});
	}

	/** LAZY */

	async onToggleCategoryCreateDialog(): Promise<void> {
		if (!this.appCategoryCreateComponent) {
			await import('../../standalone/components/category/create/create.component').then(m => {
				this.appCategoryCreateComponent = this.viewContainerRef.createComponent(m.CategoryCreateComponent);
				this.appCategoryCreateComponent.instance.appCategoryCreateSuccess.subscribe({
					next: (category: Category) => this.onCreateCategory(category),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCategoryCreateComponent.changeDetectorRef.detectChanges();
		this.appCategoryCreateComponent.instance.onToggleCategoryCreateDialog(true);
	}

	async onToggleCategoryUpdateDialog(): Promise<void> {
		if (!this.appCategoryUpdateComponent) {
			await import('../../standalone/components/category/update/update.component').then(m => {
				this.appCategoryUpdateComponent = this.viewContainerRef.createComponent(m.CategoryUpdateComponent);
				this.appCategoryUpdateComponent.instance.appCategoryUpdateSuccess.subscribe({
					next: (category: Category) => this.onUpdateCategory(category),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCategoryUpdateComponent.setInput('appCategoryUpdateCategory', this.category);

		this.appCategoryUpdateComponent.changeDetectorRef.detectChanges();
		this.appCategoryUpdateComponent.instance.onToggleCategoryUpdateDialog(true);
	}

	async onToggleCategoryDeleteDialog(): Promise<void> {
		if (!this.appCategoryDeleteComponent) {
			await import('../../standalone/components/category/delete/delete.component').then(m => {
				this.appCategoryDeleteComponent = this.viewContainerRef.createComponent(m.CategoryDeleteComponent);
				this.appCategoryDeleteComponent.instance.appCategoryDeleteSuccess.subscribe({
					next: (categoryDeleteDto: CategoryDeleteDto) => this.onDeleteCategory(categoryDeleteDto),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCategoryDeleteComponent.setInput('appCategoryDeleteCategory', this.category);
		this.appCategoryDeleteComponent.setInput('appCategoryDeleteCategoryPostList', this.postList);

		this.appCategoryDeleteComponent.changeDetectorRef.detectChanges();
		this.appCategoryDeleteComponent.instance.onToggleCategoryDeleteDialog(true);
	}
}
