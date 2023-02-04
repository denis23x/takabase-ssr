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
	Post,
	User,
	AuthService,
	TitleService,
	HelperService,
	Category,
	CategoryDeleteDto,
	CategoryUpdateDto,
	CategoryService,
	SnackbarService,
	UserService
} from '../core';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

interface CategoryEditForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

interface CategoryDeleteForm {
	name: FormControl<string>;
	categoryId: FormControl<number>;
}

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteFirstChildData$: Subscription | undefined;
	routeEvents$: Subscription | undefined;

	user: User | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	post: Post | undefined;
	postList: Post[] = [];

	category: Category | undefined;
	categoryList: Category[] = [];

	categoryEditForm: FormGroup | undefined;
	categoryEditForm$: Subscription | undefined;
	categoryEditFormIsPristine: boolean = false;
	categoryEditFormIsSubmitted: boolean = false;
	categoryEditFormToggle: boolean = false;

	categoryDeleteForm: FormGroup | undefined;
	categoryDeleteForm$: Subscription | undefined;
	categoryDeleteFormIsSubmitted: boolean = false;
	categoryDeleteFormToggle: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private authService: AuthService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private titleService: TitleService,
		private userService: UserService
	) {
		this.categoryEditForm = this.formBuilder.group<CategoryEditForm>({
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

		this.categoryDeleteForm = this.formBuilder.group<CategoryDeleteForm>({
			name: this.formBuilder.nonNullable.control('', []),
			categoryId: this.formBuilder.control(null, [])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: ([user, categoryList]: [User, Category[]]) => {
					this.user = user;

					this.categoryList = categoryList;

					// prettier-ignore
					this.titleService.setTitle(this.userService.getUserUrl(this.user).substring(1));
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteFirstChildData$ = this.activatedRoute.firstChild.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (postList: Post[]) => (this.postList = postList),
				error: (error: any) => console.error(error)
			});

		// prettier-ignore
		this.routeEvents$ = this.router.events
			.pipe(
				filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
				startWith(EMPTY),
				switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
				map((params: Params) => params.categoryId)
			)
			.subscribe({
				next: (categoryId: string | undefined) => {
					this.category = this.categoryList.find((category: Category) => {
						return category.id === Number(categoryId);
					});

					this.titleService.setTitle(this.userService.getUserUrl(this.user).substring(1));
					this.titleService.appendTitle(this.category?.name);
				},
				error: (error: any) => console.error(error)
			});

		this.categoryEditForm$ = this.categoryEditForm.valueChanges
			.pipe(
				startWith(this.categoryEditForm.value),
				filter(() => !!this.category)
			)
			.subscribe({
				next: (value: any) => {
					// prettier-ignore
					this.categoryEditFormIsPristine = Object.keys(value).every((key: string) => {
            return value[key] === this.category[key];
          });
				}
			});

		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteData$,
			this.activatedRouteFirstChildData$,
			this.routeEvents$,
			this.categoryEditForm$,
			this.authUser$
		].forEach($ => $?.unsubscribe());
	}

	onToggleCategoryEditForm(toggle: boolean): void {
		this.categoryEditFormToggle = toggle;

		if (this.categoryEditFormToggle) {
			this.categoryEditForm.patchValue(this.category);
			this.categoryEditForm.markAllAsTouched();
		} else {
			this.categoryEditForm.reset();
		}
	}

	onToggleCategoryDeleteForm(toggle: boolean): void {
		this.categoryDeleteFormToggle = toggle;

		// prettier-ignore
		if (this.categoryDeleteFormToggle) {
			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');

			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.category.name))
			]);

			abstractControl.updateValueAndValidity();
		} else {
      this.categoryDeleteForm.reset();
    }
	}

	onSubmitCategoryEditForm(): void {
		if (this.helperService.getFormValidation(this.categoryEditForm)) {
			this.categoryEditFormIsSubmitted = true;

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryEditForm.value
			};

			this.categoryService.update(categoryId, categoryUpdateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success(null, 'Category updated');

					this.category = category;
					this.categoryList = this.categoryList.map((category: Category) => {
						return category.id === this.category.id ? this.category : category;
					});

					this.categoryEditFormIsSubmitted = false;

					this.onToggleCategoryEditForm(false);
				},
				error: () => (this.categoryEditFormIsSubmitted = false)
			});
		}
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteFormIsSubmitted = true;

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};

			// prettier-ignore
			const categoryDeleteRedirect: string[] = [this.userService.getUserUrl(this.user)];

			// prettier-ignore
			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			if (!!abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
				categoryDeleteRedirect.push('category', abstractControl.value);
			}

			this.categoryService.delete(categoryId, categoryDeleteDto).subscribe({
				next: (category: Category) => {
					this.router.navigate(categoryDeleteRedirect).then(() => {
						this.snackbarService.success(null, 'Category deleted');

						this.category = category;

						// prettier-ignore
						this.categoryList = this.categoryList.filter((category: Category) => category.id !== this.category.id);
						this.category = undefined;

						this.categoryDeleteFormIsSubmitted = false;

						this.onToggleCategoryDeleteForm(false);
						this.onToggleCategoryEditForm(false);
					});
				},
				error: () => (this.categoryDeleteFormIsSubmitted = false)
			});
		}
	}
}
