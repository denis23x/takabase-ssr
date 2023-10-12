/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	ActivatedRoute,
	Data,
	Params,
	Router,
	RouterModule
} from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, filter, map, startWith } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { WindowComponent } from '../standalone/components/window/window.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../standalone/pipes/dayjs.pipe';
import { User } from '../core/models/user.model';
import { Post } from '../core/models/post.model';
import { Category } from '../core/models/category.model';
import { HelperService } from '../core/services/helper.service';
import { AuthService } from '../core/services/auth.service';
import { CategoryService } from '../core/services/category.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { UserService } from '../core/services/user.service';
import { CategoryUpdateDto } from '../core/dto/category/category-update.dto';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { MarkdownPipe } from '../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { AppTextareaResizeDirective } from '../standalone/directives/app-textarea-resize.directive';

interface PostSearchForm {
	query: FormControl<string>;
	orderBy: FormControl<string>;
}

interface CategoryEditForm {
	name: FormControl<string>;
	description: FormControl<string | null>;
}

interface CategoryDeleteForm {
	name: FormControl<string>;
	categoryId: FormControl<number>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		AvatarComponent,
		DayjsPipe,
		AppScrollPresetDirective,
		SvgIconComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		AppTextareaResizeDirective
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('categoryEditFormModal') categoryEditFormModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('categoryDeleteFormModal') categoryDeleteFormModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;
	activatedRouteFirstChildData$: Subscription | undefined;
	activatedRouteFirstChildUrl$: Subscription | undefined;

	user: User | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	post: Post | undefined;
	postList: Post[] = [];

	postSearchForm: FormGroup | undefined;
	postSearchForm$: Subscription | undefined;
	postSearchFormToggle: boolean = false;
	postSearchFormOrderByList: string[] = ['newest', 'oldest'];

	category: Category | undefined;
	categoryList: Category[] = [];

	categoryEditForm: FormGroup | undefined;
	categoryEditForm$: Subscription | undefined;
	categoryEditFormIsPristine: boolean = false;

	categoryDeleteForm: FormGroup | undefined;
	categoryDeleteForm$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private authService: AuthService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private userService: UserService
	) {
		this.categoryEditForm = this.formBuilder.group<CategoryEditForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
		this.categoryDeleteForm = this.formBuilder.group<CategoryDeleteForm>({
			name: this.formBuilder.nonNullable.control('', []),
			categoryId: this.formBuilder.control(null, [])
		});
		this.postSearchForm = this.formBuilder.group<PostSearchForm>({
			query: this.formBuilder.nonNullable.control('', [
				Validators.minLength(2),
				Validators.maxLength(24)
			]),
			orderBy: this.formBuilder.nonNullable.control('', [])
		});
	}

	ngOnInit(): void {
		/** Resolver */

		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: ([user, categoryList]: [User, Category[]]) => {
					this.user = user;

					this.categoryList = categoryList;
				},
				error: (error: any) => console.error(error)
			});

		/** Get postList for categoryDeleteForm modal */

		this.activatedRouteFirstChildData$ = this.activatedRoute.firstChild.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (postList: Post[]) => (this.postList = postList),
				error: (error: any) => console.error(error)
			});

		/** Get category for categoryEditForm modal */

		// prettier-ignore
		this.activatedRouteFirstChildUrl$ = this.activatedRoute.firstChild.url.subscribe({
				next: () => {
					const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId'));

					this.category = this.categoryList.find((category: Category) => {
						return category.id === Number(categoryId);
					});
				},
				error: (error: any) => console.error(error)
			});

		/** Set queryParams to postSearchForm */

		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(filter((params: Params) => params.query || params.orderBy))
			.subscribe({
				next: (params: Params) => {
					this.postSearchForm.patchValue(params, { emitEvent: false });
					this.postSearchForm.markAllAsTouched();

					this.postSearchFormToggle = true;
				},
				error: (error: any) => console.error(error)
			});

		/** Set postSearchForm to queryParams */

		this.postSearchForm$ = this.postSearchForm.valueChanges
			.pipe(
				debounceTime(400),
				filter(() => this.postSearchForm.valid)
			)
			.subscribe({
				next: () => {
					const value: any = this.postSearchForm.value;

					this.router
						.navigate([], {
							relativeTo: this.activatedRoute,
							queryParams: {
								query: value.query || null,
								orderBy: value.orderBy || null
							},
							queryParamsHandling: 'merge'
						})
						.then(() => console.debug('Route changed'));
				},
				error: (error: any) => console.error(error)
			});

		/** Pristine state of categoryEditForm */

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
			this.activatedRouteQueryParams$,
			this.activatedRouteFirstChildData$,
			this.activatedRouteFirstChildUrl$,
			this.postSearchForm$,
			this.categoryEditForm$,
			this.categoryDeleteForm$,
			this.authUser$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	onTogglePostSearchForm(): void {
		if (this.postSearchFormToggle) {
			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: {
						query: null,
						orderBy: null
					},
					queryParamsHandling: 'merge'
				})
				.then(() => console.debug('Route changed'));

			this.postSearchForm.reset();

			this.postSearchFormToggle = false;
		} else {
			this.postSearchFormToggle = true;
		}
	}

	onToggleCategoryEditForm(toggle: boolean): void {
		if (toggle) {
			this.categoryEditForm.patchValue(this.category);
			this.categoryEditForm.markAllAsTouched();
			this.categoryEditFormModal.nativeElement.showModal();
		} else {
			this.categoryEditForm.reset();
			this.categoryEditFormModal.nativeElement.close();
		}
	}

	onToggleCategoryDeleteForm(toggle: boolean): void {
		if (toggle) {
			this.categoryEditForm.disable();
		} else {
			this.categoryEditForm.enable();
		}

		/** Prepare categoryDeleteForm */

		if (toggle) {
			this.categoryDeleteForm.reset();
			this.categoryDeleteFormModal.nativeElement.showModal();

			// prettier-ignore
			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');

			// prettier-ignore
			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.category.name))
			]);

			abstractControl.updateValueAndValidity();
		} else {
			this.categoryDeleteForm.reset();
			this.categoryDeleteFormModal.nativeElement.close();
		}
	}

	onSubmitCategoryEditForm(): void {
		if (this.helperService.getFormValidation(this.categoryEditForm)) {
			this.categoryEditForm.disable();

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

					this.categoryEditForm.enable();

					this.onToggleCategoryEditForm(false);
				},
				error: () => this.categoryEditForm.enable()
			});
		}
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteForm.disable();

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};

			// prettier-ignore
			const categoryDeleteRedirect: string[] = [this.userService.getUserUrl(this.user)];

			// prettier-ignore
			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			if (abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
				categoryDeleteRedirect.push('category', abstractControl.value);
			}

			this.categoryService.delete(categoryId, categoryDeleteDto).subscribe({
				next: () => {
					this.snackbarService.success(null, 'Category deleted');

					this.category = undefined;
					this.categoryList = this.categoryList.filter((category: Category) => {
						return category.id !== categoryId;
					});

					this.categoryDeleteForm.enable();

					this.onToggleCategoryDeleteForm(false);
					this.onToggleCategoryEditForm(false);

					this.router
						.navigate(categoryDeleteRedirect)
						.then(() => console.debug('Route changed'));
				},
				error: () => this.categoryDeleteForm.enable()
			});
		}
	}
}
