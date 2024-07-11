/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
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
import { CategoryCreateDto } from '../../../../core/dto/category/category-create.dto';
import { Category } from '../../../../core/models/category.model';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription, switchMap } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { AIModerateTextDto } from '../../../../core/dto/ai/ai-moderate-text.dto';
import { AIService } from '../../../../core/services/ai.service';

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
	selector: 'app-category-create, [appCategoryCreate]',
	templateUrl: './create.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);
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
	categoryFormRequest$: Subscription | undefined;
	categoryCreateDialogToggle: boolean = false;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleCategoryCreateDialog(false));
		}
	}

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

			const categoryCreateDto: CategoryCreateDto = {
				...this.categoryForm.value
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(categoryCreateDto)
			};

			/** Moderate and create */

			this.categoryFormRequest$?.unsubscribe();
			this.categoryFormRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(switchMap(() => this.categoryService.create(categoryCreateDto)))
				.subscribe({
					next: (category: Category) => {
						this.snackbarService.success('Cheers!', 'Category created');

						this.appCategoryCreateSuccess.emit(category);

						this.categoryForm.enable();

						this.onToggleCategoryCreateDialog(false);
					},
					error: () => this.categoryForm.enable()
				});
		}
	}
}
