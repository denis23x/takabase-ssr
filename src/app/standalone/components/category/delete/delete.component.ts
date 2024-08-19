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
	ValidatorFn,
	Validators
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription } from 'rxjs';
import { HelperService } from '../../../../core/services/helper.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { UserStore } from '../../../../user/user.store';
import type { Post } from '../../../../core/models/post.model';
import type { CategoryDeleteDto } from '../../../../core/dto/category/category-delete.dto';
import type { Category } from '../../../../core/models/category.model';

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
	providers: [CategoryService],
	selector: 'app-category-delete, [appCategoryDelete]',
	templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);
	private readonly userStore: UserStore = inject(UserStore);

	@ViewChild('categoryDeleteDialogElement') categoryDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@Output() appCategoryDeleteSuccess: EventEmitter<Category & CategoryDeleteDto> = new EventEmitter<Category & CategoryDeleteDto>();
	@Output() appCategoryDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appCategoryDeleteCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCategoryDeleteCategoryPostList(categoryPostList: Post[]) {
		this.categoryPostList = categoryPostList;
	}

	category: Category | undefined;
	categoryList: Category[] = [];
	categoryList$: Subscription | undefined;
	categoryPostList: Post[] = [];

	categoryDeleteForm: FormGroup = this.formBuilder.group<CategoryDeleteForm>({
		name: this.formBuilder.nonNullable.control('', []),
		categoryId: this.formBuilder.control(null, [])
	});
	categoryDeleteFormRequest$: Subscription | undefined;
	categoryDeleteDialogToggle: boolean = false;

	ngOnInit(): void {
		this.categoryList$?.unsubscribe();
		this.categoryList$ = this.userStore.getCategoryList().subscribe({
			next: (categoryList: Category[]) => (this.categoryList = categoryList),
			error: (error: any) => console.error(error)
		});

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleCategoryDeleteDialog(false));
		}
	}

	ngOnDestroy(): void {
		[this.categoryList$, this.categoryDeleteFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryDeleteDialog(toggle: boolean): void {
		this.categoryDeleteDialogToggle = toggle;

		if (toggle) {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.showModal();

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');
			const abstractControlValidator: (...args: any) => ValidatorFn = this.helperService.getCustomValidator('match');

			abstractControl.setValidators([Validators.required, abstractControlValidator(this.category.name)]);
			abstractControl.updateValueAndValidity();
		} else {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.close();
		}

		this.appCategoryDeleteToggle.emit(toggle);
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteForm.disable();

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			// Attach firebaseUid only if exists

			if (abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
			}

			this.categoryDeleteFormRequest$?.unsubscribe();
			this.categoryDeleteFormRequest$ = this.categoryService.delete(categoryId, categoryDeleteDto).subscribe({
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
