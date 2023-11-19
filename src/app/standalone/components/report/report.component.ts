/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { Subscription } from 'rxjs';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../../directives/app-textarea-resize.directive';
import { DropdownComponent } from '../dropdown/dropdown.component';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ReportCreateDto } from '../../../core/dto/report/report-create.dto';
import { ReportService } from '../../../core/services/report.service';

interface ReportForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		DropdownComponent,
		ReactiveFormsModule,
		SvgIconComponent
	],
	selector: 'app-report, [appReport]',
	templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit, OnDestroy {
	@ViewChild('reportFormDialog') reportFormDialog: ElementRef<HTMLDialogElement> | undefined;

	reportForm: FormGroup | undefined;
	reportFormRequest$: Subscription | undefined;
	reportFormDialogToggle: boolean = false;
	reportFormDialogToggle$: Subscription | undefined;
	reportFormNameList: string[] = [
		'Terms and conditions',
		'Sex, sexuality and nudity',
		'Spam Everywhere',
		'Time spent waiting',
		'Technical glitch'
	];

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private reportService: ReportService,
		private snackbarService: SnackbarService
	) {
		this.reportForm = this.formBuilder.group<ReportForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(255)
			])
		});
	}

	ngOnInit(): void {
		this.reportFormDialogToggle$ = this.reportService.reportFormDialogToggle$.subscribe({
			next: (reportFormDialogToggle: boolean) => this.onToggleReportForm(reportFormDialogToggle),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.reportFormDialogToggle$, this.reportFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleReportForm(toggle: boolean): void {
		if (toggle) {
			this.reportFormDialog.nativeElement.showModal();
		} else {
			this.reportFormDialog.nativeElement.close();
		}

		this.reportForm.reset();
	}

	onSelectReportFormName(reportFormName: string): void {
		const abstractControl: AbstractControl = this.reportForm.get('name');

		abstractControl.setValue(reportFormName);
		abstractControl.updateValueAndValidity();
	}

	onSubmitReportForm(): void {
		if (this.helperService.getFormValidation(this.reportForm)) {
			this.reportForm.disable();

			const reportCreateDto: ReportCreateDto = {
				...this.reportForm.value
			};

			this.reportFormRequest$ = this.reportService.create(reportCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Great!', 'Thanks for your feedback');

					this.reportForm.enable();

					this.onToggleReportForm(false);
				},
				error: () => this.reportForm.enable()
			});
		}
	}
}
