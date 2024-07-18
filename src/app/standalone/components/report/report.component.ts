/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	Input,
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
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { ReportCreateDto } from '../../../core/dto/report/report-create.dto';
import { ReportService } from '../../../core/services/report.service';
import { BadgeErrorComponent } from '../badge-error/badge-error.component';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { PlatformService } from '../../../core/services/platform.service';
import { Post } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';
import { FireStoragePipe } from '../../pipes/fire-storage.pipe';

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
		FireStoragePipe
	],
	providers: [ReportService],
	selector: 'app-report, [appReport]',
	templateUrl: './report.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	@ViewChild('reportDialog') reportDialog: ElementRef<HTMLDialogElement> | undefined;

	@Input()
	set appReportUser(user: User) {
		this.reportUser = user;
	}

	@Input()
	set appReportPost(post: Post) {
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

	reportUser: User | undefined;
	reportPost: Post | undefined;
	reportDialogToggle: boolean = false;

	ngOnInit(): void {
		this.reportSubjectUrl = this.helperService.getURL().toString();
		this.reportSubjectName = this.reportUser?.name || this.reportPost?.name;

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleReportDialog(false));
		}
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
				subject: this.reportUser || this.reportPost
			};

			this.reportFormRequest$?.unsubscribe();
			this.reportFormRequest$ = this.reportService.create(reportCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Sent', 'Thanks for your report');

					this.onToggleReportDialog(false);
				},
				error: () => this.reportForm.enable()
			});
		}
	}
}
