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
import { TextareaAutosizeDirective } from '../../../directives/app-textarea-autosize.directive';
import { Category } from '../../../../core/models/category.model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CategoryUpdateDto } from '../../../../core/dto/category/category-update.dto';
import { Subscription, switchMap } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { AIModerateTextDto } from '../../../../core/dto/ai/ai-moderate-text.dto';
import { AIService } from '../../../../core/services/ai.service';

interface CategoryUpdateForm {
	name: FormControl<string>;
	description: FormControl<string | null>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		InputTrimWhitespaceDirective,
		TextareaAutosizeDirective,
		ReactiveFormsModule,
		BadgeErrorComponent
	],
	selector: 'app-category-update, [appCategoryUpdate]',
	templateUrl: './update.component.html'
})
export class CategoryUpdateComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);
	private readonly aiService: AIService = inject(AIService);

	@ViewChild('categoryUpdateDialogElement') categoryUpdateDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appCategoryUpdateToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appCategoryUpdateSuccess: EventEmitter<Category> = new EventEmitter<Category>();

	@Input({ required: true })
	set appCategoryUpdateCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCategoryUpdateCategoryList(categoryList: Category[]) {
		this.categoryList = categoryList;
	}

	category: Category | undefined;
	categoryList: Category[] = [];

	categoryUpdateForm: FormGroup = this.formBuilder.group<CategoryUpdateForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(48)
		]),
		description: this.formBuilder.control(null, [Validators.minLength(16), Validators.maxLength(192)])
	});
	categoryUpdateFormRequest$: Subscription | undefined;

	categoryUpdateFormIsPristine$: Subscription | undefined;
	categoryUpdateFormIsPristine: boolean = false;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleCategoryUpdateDialog(false));
		}
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.categoryUpdateFormIsPristine$, this.categoryUpdateFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryUpdateDialog(toggle: boolean): void {
		if (toggle) {
			this.categoryUpdateForm.patchValue(this.category);
			this.categoryUpdateForm.markAllAsTouched();

			this.categoryUpdateDialogElement.nativeElement.showModal();

			this.categoryUpdateFormIsPristine$?.unsubscribe();
			this.categoryUpdateFormIsPristine$ = this.categoryUpdateForm.valueChanges
				.pipe(startWith(this.categoryUpdateForm.value))
				.subscribe({
					next: (value: any) => {
						this.categoryUpdateFormIsPristine = Object.keys(value).every((key: string) => {
							// @ts-ignore
							return value[key] === this.category[key];
						});
					},
					error: (error: any) => console.error(error)
				});
		} else {
			this.categoryUpdateForm.reset();

			this.categoryUpdateDialogElement.nativeElement.close();

			this.categoryUpdateFormIsPristine = true;
			this.categoryUpdateFormIsPristine$?.unsubscribe();
		}

		this.appCategoryUpdateToggle.emit(toggle);
	}

	onSubmitCategoryUpdateForm(): void {
		if (this.helperService.getFormValidation(this.categoryUpdateForm)) {
			this.categoryUpdateForm.disable();

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryUpdateForm.value
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(categoryUpdateDto)
			};

			/** Moderate and update */

			this.categoryUpdateFormRequest$?.unsubscribe();
			this.categoryUpdateFormRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(switchMap(() => this.categoryService.update(categoryId, categoryUpdateDto)))
				.subscribe({
					next: (category: Category) => {
						this.snackbarService.success(null, 'Category updated');

						this.appCategoryUpdateSuccess.emit(category);

						this.categoryUpdateForm.enable();

						this.onToggleCategoryUpdateDialog(false);
					},
					error: () => this.categoryUpdateForm.enable()
				});
		}
	}
}
