/** @format */

import { Component, ElementRef, EventEmitter, inject, OnDestroy, Output, ViewChild } from '@angular/core';
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
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { AIService } from '../../../../core/services/ai.service';
import { tap } from 'rxjs/operators';
import type { Category } from '../../../../core/models/category.model';
import type { CategoryCreateDto } from '../../../../core/dto/category/category-create.dto';

interface CategoryForm {
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
	selector: 'app-category-create, [appCategoryCreate]',
	templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly aiService: AIService = inject(AIService);

	@ViewChild('categoryCreateDialogElement') categoryCreateDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appCategoryCreateToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appCategoryCreateSuccess: EventEmitter<Category> = new EventEmitter<Category>();

	categoryForm: FormGroup = this.formBuilder.group<CategoryForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(48)
		]),
		description: this.formBuilder.control(null, [Validators.minLength(16), Validators.maxLength(192)])
	});
	categoryFormStage: string = 'Submit';
	categoryFormRequest$: Subscription | undefined;
	categoryCreateDialogToggle: boolean = false;

	ngOnDestroy(): void {
		[this.categoryFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryCreateDialog(toggle: boolean): void {
		this.categoryCreateDialogToggle = toggle;

		if (toggle) {
			this.categoryCreateDialogElement.nativeElement.showModal();
		} else {
			this.categoryCreateDialogElement.nativeElement.close();
		}

		/** categoryForm reset */

		this.categoryForm.reset();

		this.appCategoryCreateToggle.emit(toggle);
	}

	onSubmitCategoryForm(): void {
		if (this.helperService.getFormValidation(this.categoryForm)) {
			this.categoryForm.disable();
			this.categoryFormStage = 'Moderation';

			const categoryCreateDto: CategoryCreateDto = {
				...this.categoryForm.value,
				description: this.categoryForm.value.description || null
			};

			/** Moderate and create */

			this.categoryFormRequest$?.unsubscribe();
			this.categoryFormRequest$ = this.aiService
				.getModerationOpenAI(this.aiService.getModerationCreateTextDto(categoryCreateDto))
				.pipe(
					tap(() => (this.categoryFormStage = 'Saving')),
					switchMap(() => this.categoryService.create(categoryCreateDto))
				)
				.subscribe({
					next: (category: Category) => {
						this.snackbarService.success('Cheers!', 'Category created');

						this.appCategoryCreateSuccess.emit(category);

						this.categoryForm.enable();

						this.onToggleCategoryCreateDialog(false);
					},
					error: () => {
						this.categoryForm.enable();
						this.categoryFormStage = 'Submit';
					}
				});
		}
	}
}
