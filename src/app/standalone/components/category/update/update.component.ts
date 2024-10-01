/** @format */

import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { TextareaAutosizeDirective } from '../../../directives/app-textarea-autosize.directive';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription, switchMap } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { AIService } from '../../../../core/services/ai.service';
import type { Category } from '../../../../core/models/category.model';
import type { CategoryUpdateDto } from '../../../../core/dto/category/category-update.dto';
import type { AIModerateTextDto } from '../../../../core/dto/ai/ai-moderate-text.dto';

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
	providers: [AIService, CategoryService],
	selector: 'app-category-update, [appCategoryUpdate]',
	templateUrl: './update.component.html'
})
export class CategoryUpdateComponent implements OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly aiService: AIService = inject(AIService);

	@ViewChild('categoryUpdateDialogElement') categoryUpdateDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appCategoryUpdateToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appCategoryUpdateSuccess: EventEmitter<Category> = new EventEmitter<Category>();

	@Input({ required: true })
	set appCategoryUpdateCategory(category: Category) {
		this.category = category;
	}

	category: Category | undefined;

	categoryUpdateForm: FormGroup = this.formBuilder.group<CategoryUpdateForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(48)
		]),
		description: this.formBuilder.control(null, [Validators.minLength(16), Validators.maxLength(192)])
	});
	categoryUpdateFormStage: string = 'Submit';
	categoryUpdateFormRequest$: Subscription | undefined;

	categoryUpdateFormIsPristine$: Subscription | undefined;
	categoryUpdateFormIsPristine: boolean = false;

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
							return (value[key] || null) === this.category[key as keyof Category];
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
			this.categoryUpdateFormStage = 'Moderation';

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryUpdateForm.value,
				description: this.categoryUpdateForm.value.description || null
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(categoryUpdateDto)
			};

			/** Moderate and update */

			this.categoryUpdateFormRequest$?.unsubscribe();
			this.categoryUpdateFormRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(
					tap(() => (this.categoryUpdateFormStage = 'Saving')),
					switchMap(() => this.categoryService.update(categoryId, categoryUpdateDto))
				)
				.subscribe({
					next: (category: Category) => {
						this.snackbarService.success(null, 'Category updated');

						this.appCategoryUpdateSuccess.emit(category);

						this.categoryUpdateForm.enable();

						this.onToggleCategoryUpdateDialog(false);
					},
					error: () => {
						this.categoryUpdateForm.enable();
						this.categoryUpdateFormStage = 'Submit';
					}
				});
		}
	}
}
