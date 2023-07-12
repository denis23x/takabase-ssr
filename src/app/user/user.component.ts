/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
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
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { OverlayComponent } from '../standalone/components/overlay/overlay.component';
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
import { TitleService } from '../core/services/title.service';
import { UserService } from '../core/services/user.service';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { CategoryUpdateDto } from '../core/dto/category/category-update.dto';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { MarkdownPipe } from '../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../standalone/pipes/sanitizer.pipe';

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
		AppScrollIntoViewDirective,
		SvgIconComponent,
		OverlayComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		MarkdownPipe,
		SanitizerPipe
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
	activatedRouteFirstChildData$: Subscription | undefined;
	activatedRouteFirstChildUrl$: Subscription | undefined;

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
		private titleService: TitleService,
		private userService: UserService,
		private metaService: MetaService
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
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: ([user, categoryList]: [User, Category[]]) => {
					this.user = user;

					this.categoryList = categoryList;
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
		this.activatedRouteFirstChildUrl$ = this.activatedRoute.firstChild.url.subscribe({
				next: () => {
					const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId'));

					this.category = this.categoryList.find((category: Category) => {
						return category.id === Number(categoryId);
					});

					this.titleService.setTitle(this.user.name);

          if (!!this.category) {
            this.titleService.appendTitle(this.category.name);
          }

					this.setMeta();
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
			this.activatedRouteFirstChildUrl$,
			this.categoryEditForm$,
			this.authUser$
		].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const username: string = this.user.name;

		const title: string = this.category?.name || username;

		// prettier-ignore
		const description: string = this.category?.description || this.user.description;

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:image']: this.user.avatar,
			['og:image:alt']: username,
			['og:image:type']: 'image/png'
		};

		if (!!this.category) {
			metaOpenGraph['og:type'] = 'website';
		} else {
			metaOpenGraph['og:type'] = 'profile';
			metaOpenGraph['profile:username'] = username;
		}

		// prettier-ignore
		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
			['twitter:image']: this.user.avatar,
			['twitter:image:alt']: username
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
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

			if (!!abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
				categoryDeleteRedirect.push('category', abstractControl.value);
			}

			this.categoryService.delete(categoryId, categoryDeleteDto).subscribe({
				next: (category: Category) => {
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
