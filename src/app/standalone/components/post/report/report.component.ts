/** @format */

import {
	ChangeDetectionStrategy,
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
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../../window/window.component';
import { Subscription } from 'rxjs';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { TextareaAutosizeDirective } from '../../../directives/app-textarea-autosize.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { HelperService } from '../../../../core/services/helper.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { ReportService } from '../../../../core/services/report.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { RouterModule } from '@angular/router';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import type { Post } from '../../../../core/models/post.model';
import type { ReportCreateDto } from '../../../../core/dto/report/report-create.dto';

interface ReportForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		WindowComponent,
		InputTrimWhitespaceDirective,
		TextareaAutosizeDirective,
		DropdownComponent,
		ReactiveFormsModule,
		SvgIconComponent,
		BadgeErrorComponent,
		SkeletonDirective
	],
	providers: [ReportService],
	selector: 'app-post-report, [appPostReport]',
	templateUrl: './report.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostReportComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@ViewChild('reportDialog') reportDialog: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostReportSuccess: EventEmitter<any> = new EventEmitter<any>();
	@Output() appPostReportToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostReportPost(post: Post) {
		this.reportPost = post;
	}

	reportSubjectUrl: string | undefined;
	reportSubjectName: string | undefined;

	reportForm: FormGroup = this.formBuilder.group<ReportForm>({
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
	reportFormRequest$: Subscription | undefined;
	reportFormNameList: string[] = ['Terms and conditions', 'Sex, sexuality and nudity', 'Technical glitch', 'Spam'];

	reportPost: Post | undefined;
	reportDialogToggle: boolean = false;

	ngOnInit(): void {
		this.reportSubjectUrl = this.helperService.getURL().toString();
		this.reportSubjectName = this.reportPost.name;
	}

	ngOnDestroy(): void {
		[this.reportFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleReportDialog(toggle: boolean): void {
		this.reportDialogToggle = toggle;

		if (toggle) {
			this.reportDialog.nativeElement.showModal();
		} else {
			this.reportDialog.nativeElement.close();
		}

		this.appPostReportToggle.emit(toggle);
	}

	onSelectReportFormName(reportFormName: string): void {
		const abstractControl: AbstractControl = this.reportForm.get('name');

		abstractControl.setValue(reportFormName);
		abstractControl.markAsTouched();
	}

	onSubmitReportForm(): void {
		if (this.helperService.getFormValidation(this.reportForm)) {
			this.reportForm.disable();

			const reportCreateDto: ReportCreateDto = {
				...this.reportForm.value,
				subject: this.reportPost
			};

			this.reportFormRequest$?.unsubscribe();
			this.reportFormRequest$ = this.reportService.create(reportCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Sent', 'Thanks for your report');

					this.appPostReportSuccess.emit();

					this.reportForm.reset();
					this.reportForm.enable();

					this.onToggleReportDialog(false);
				},
				error: () => this.reportForm.enable()
			});
		}
	}
}
