/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription } from 'rxjs';
import { Post } from '../../../../core/models/post.model';
import { CategoryDeleteDto } from '../../../../core/dto/category/category-delete.dto';
import { Category } from '../../../../core/models/category.model';
import { HelperService } from '../../../../core/services/helper.service';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';

interface CategoryDeleteForm {
	name: FormControl<string>;
	categoryId: FormControl<number>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		InputTrimWhitespaceDirective,
		ReactiveFormsModule,
		BadgeErrorComponent
	],
	selector: 'app-category-delete, [appCategoryDelete]',
	templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	// prettier-ignore
	@ViewChild('categoryDeleteDialogElement') categoryDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@Output() appCategoryDeleteSuccess: EventEmitter<Category & CategoryDeleteDto> = new EventEmitter<Category & CategoryDeleteDto>();

	@Input({ required: true })
	set appCategoryDeleteCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCategoryDeleteCategoryList(categoryList: Category[]) {
		this.categoryList = categoryList;
	}

	@Input()
	set appCategoryDeletePostList(postList: Post[]) {
		this.postList = postList;
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;

	categoryDeleteForm: FormGroup = this.formBuilder.group<CategoryDeleteForm>({
		name: this.formBuilder.nonNullable.control('', []),
		categoryId: this.formBuilder.control(null, [])
	});
	categoryDeleteFormRequest$: Subscription | undefined;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleCategoryDeleteDialog(false));
		}
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.categoryDeleteFormRequest$, this.postListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryDeleteDialog(toggle: boolean): void {
		if (toggle) {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.showModal();

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');

			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.category.name))
			]);

			abstractControl.updateValueAndValidity();
		} else {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.close();
		}
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteForm.disable();

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			// Move posts to another category

			if (abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
			}

			this.categoryDeleteFormRequest$?.unsubscribe();
			this.categoryDeleteFormRequest$ = this.categoryService
				.delete(categoryId, categoryDeleteDto)
				.subscribe({
					next: () => {
						this.snackbarService.success(null, 'Category deleted');

						this.appCategoryDeleteSuccess.emit({
							...this.category,
							...categoryDeleteDto
						});

						this.category = undefined;
						this.categoryList = this.categoryList.filter((category: Category) => {
							return category.id !== categoryId;
						});

						this.categoryDeleteForm.enable();

						this.onToggleCategoryDeleteDialog(false);
					},
					error: () => this.categoryDeleteForm.enable()
				});
		}
	}
}
