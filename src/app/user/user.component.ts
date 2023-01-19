/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	ActivatedRoute,
	NavigationEnd,
	Router,
	Event as RouterEvent,
	Data,
	Params
} from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import {
	User,
	Category,
	AuthService,
	TitleService,
	HelperService,
	CategoryUpdateDto,
	CategoryService,
	SnackbarService
} from '../core';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

interface CategoryForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	routeEvents$: Subscription | undefined;

	user: User | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];
	categoryForm: FormGroup | undefined;
	categoryFormIsSubmitted: boolean = false;
	categoryFormToggle: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private authService: AuthService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private titleService: TitleService
	) {
		this.categoryForm = this.formBuilder.group<CategoryForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			description: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(255)
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: ([user, categoryList]: [User, Category[]]) => {
					this.user = user;

					this.categoryList = categoryList;

					this.titleService.setTitle(this.user.name);
				},
				error: (error: any) => console.error(error)
			});

		this.routeEvents$ = this.router.events
			.pipe(
				// prettier-ignore
				filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
				startWith(EMPTY),
				switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
				map((params: Params) => params.categoryId)
			)
			.subscribe({
				next: (categoryId: string | undefined) => {
					// prettier-ignore
					const category: Category | undefined = this.categoryList.find((category: Category) => {
            return category.id === Number(categoryId);
          });

					/** Title handler */

					if (!!category) {
						if (!!this.category) {
							this.titleService.updateTitle(this.category.name, category.name);
						} else {
							this.titleService.appendTitle(category.name);
						}
					} else {
						this.titleService.setTitle(this.user.name);
					}

					this.category = category;
				},
				error: (error: any) => console.error(error)
			});

		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$, this.routeEvents$, this.authUser$].forEach($ =>
			$?.unsubscribe()
		);
	}

	onToggleCategoryForm(toggle: boolean): void {
		this.categoryFormToggle = toggle;
		this.categoryForm.reset(this.category);
		this.categoryForm.markAllAsTouched();
	}

	onSubmitCategoryForm(): void {
		if (this.helperService.getFormValidation(this.categoryForm)) {
			this.categoryFormIsSubmitted = true;

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryForm.value
			};

			// this.categoryService.delete(categoryId),

			this.categoryService.update(categoryId, categoryUpdateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success(null, 'Category updated');

					this.category = category;
					this.categoryList = this.categoryList.map((category: Category) => {
						if (category.id === this.category.id) {
							return this.category;
						} else {
							return category;
						}
					});

					this.categoryFormIsSubmitted = false;

					this.onToggleCategoryForm(false);
				},
				error: () => (this.categoryFormIsSubmitted = false)
			});
		}
	}
}
