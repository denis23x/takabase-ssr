/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	inject,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { Subscription } from 'rxjs';
import { InputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { TextareaAutosizeDirective } from '../../directives/app-textarea-autosize.directive';
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
import { BadgeErrorComponent } from '../badge-error/badge-error.component';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { ReportSubject } from '../../../core/models/report.model';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { PlatformService } from '../../../core/services/platform.service';
import { filter } from 'rxjs/operators';
import { AppCheckPipe } from '../../pipes/app-check.pipe';

interface ReportForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		NgOptimizedImage,
		WindowComponent,
		InputTrimWhitespaceDirective,
		TextareaAutosizeDirective,
		DropdownComponent,
		ReactiveFormsModule,
		SvgIconComponent,
		BadgeErrorComponent,
		AvatarComponent,
		SkeletonDirective,
		AppCheckPipe
	],
	selector: 'app-report, [appReport]',
	templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	@ViewChild('reportDialog') reportDialog: ElementRef<HTMLDialogElement> | undefined;

	reportSubject: ReportSubject | null = null;
	reportSubject$: Subscription | undefined;
	reportSubjectUrl: string | undefined;
	reportSubjectName: string | undefined;

	reportDialogToggle: boolean = false;
	reportDialogToggle$: Subscription | undefined;

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
	reportFormNameList: string[] = [
		'Terms and conditions',
		'Sex, sexuality and nudity',
		'Technical glitch',
		'Spam'
	];

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleReportDialog(false));
		}
	}

	ngAfterViewInit(): void {
		this.reportSubject$?.unsubscribe();
		this.reportSubject$ = this.reportService.reportSubject$
			.pipe(filter((reportSubject: ReportSubject | null) => !!reportSubject))
			.subscribe({
				next: (reportSubject: ReportSubject) => {
					this.reportSubject = reportSubject;
					this.reportSubjectUrl = this.helperService.getURL().toString();
					this.reportSubjectName = reportSubject.user?.name || reportSubject.post?.name;
				},
				error: (error: any) => console.error(error)
			});

		this.reportDialogToggle$?.unsubscribe();
		this.reportDialogToggle$ = this.reportService.reportDialogToggle$.subscribe({
			next: (reportDialogToggle: boolean) => this.onToggleReportDialog(reportDialogToggle),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.reportSubject$, this.reportDialogToggle$, this.reportFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleReportDialog(toggle: boolean): void {
		this.reportDialogToggle = toggle;

		if (toggle) {
			this.reportDialog.nativeElement.showModal();
		} else {
			this.reportDialog.nativeElement.close();
		}

		this.reportForm.reset();
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
				subject: this.reportSubject
			};

			this.reportFormRequest$?.unsubscribe();
			this.reportFormRequest$ = this.reportService.create(reportCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Great!', 'Thanks for your report');

					/* Close and clear */

					this.reportForm.enable();

					/* Service */

					this.reportService.reportSubject$.next(null);
					this.reportService.reportDialogToggle$.next(false);
				},
				error: () => this.reportForm.enable()
			});
		}
	}
}
