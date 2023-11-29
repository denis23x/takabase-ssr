/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { Subscription } from 'rxjs';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { AppTextareaAutosizeDirective } from '../../directives/app-textarea-autosize.directive';
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
import { filter } from 'rxjs/operators';

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
		AppTextareaAutosizeDirective,
		DropdownComponent,
		ReactiveFormsModule,
		SvgIconComponent
	],
	selector: 'app-report, [appReport]',
	templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit, OnDestroy {
	@ViewChild('reportDialog') reportDialog: ElementRef<HTMLDialogElement> | undefined;

	reportDialogToggle: boolean = false;
	reportDialogToggle$: Subscription | undefined;

	reportForm: FormGroup | undefined;
	reportFormRequest$: Subscription | undefined;
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
		this.reportDialogToggle$ = this.reportService.reportDialogToggle$
			.pipe(filter(() => !!this.reportDialog))
			.subscribe({
				next: (reportDialogToggle: boolean) => this.onToggleReportDialog(reportDialogToggle),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.reportDialogToggle$, this.reportFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleReportDialog(toggle: boolean): void {
		if (toggle) {
			this.reportDialog.nativeElement.showModal();
		} else {
			this.reportDialog.nativeElement.close();
		}

		this.reportDialogToggle = toggle;
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

			this.reportFormRequest$?.unsubscribe();
			this.reportFormRequest$ = this.reportService.create(reportCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Great!', 'Thanks for your feedback');

					this.reportForm.enable();

					this.onToggleReportDialog(false);
				},
				error: () => this.reportForm.enable()
			});
		}
	}
}
