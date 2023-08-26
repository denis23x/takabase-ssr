/** @format */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../standalone/directives/app-textarea-resize.directive';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { WindowComponent } from '../standalone/components/window/window.component';
import { HelperService } from '../core/services/helper.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { FeedbackService } from '../core/services/feedback.service';
import { FeedbackCreateDto } from '../core/dto/feedback/feedback-create.dto';
import { AppAuthenticatedDirective } from '../standalone/directives/app-authenticated.directive';
import { Feedback } from '../core/models/feedback.model';

interface FeedbackForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AppScrollIntoViewDirective,
		SvgIconComponent,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		ReactiveFormsModule,
		WindowComponent,
		AppAuthenticatedDirective
	],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	// prettier-ignore
	@ViewChild('feedbackFormModal') feedbackFormModal: ElementRef<HTMLDialogElement> | undefined;

	feedback: Feedback | undefined;
	feedbackForm: FormGroup | undefined;

	helpNavigationList: any[] = [
		{
			path: 'features',
			name: 'Features'
		},
		{
			path: 'code-highlight',
			name: 'Code highlight'
		},
		{
			path: 'style-safe-list',
			name: 'Style safe list'
		},
		{
			path: 'deep-dive',
			name: 'Deep dive'
		},
		{
			path: 'compatibility',
			name: 'Compatibility'
		},
		{
			path: 'road-map',
			name: 'Road map'
		}
	];

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private snackbarService: SnackbarService,
		private metaService: MetaService,
		private feedbackService: FeedbackService
	) {
		this.feedbackForm = this.formBuilder.group<FeedbackForm>({
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
		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Help & Support';

		// prettier-ignore
		const description: string = 'Find answers to commonly asked questions and resources to assist you in navigating and making the most out of Draft';

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		// prettier-ignore
		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}

	onToggleFeedbackForm(toggle: boolean): void {
		if (toggle) {
			this.feedbackFormModal.nativeElement.showModal();
		} else {
			this.feedbackFormModal.nativeElement.close();
		}

		this.feedbackForm.reset();
	}

	onSubmitFeedbackForm(): void {
		if (this.helperService.getFormValidation(this.feedbackForm)) {
			this.feedbackForm.disable();

			const feedbackCreateDto: FeedbackCreateDto = {
				...this.feedbackForm.value
			};

			this.feedbackService.create(feedbackCreateDto).subscribe({
				next: () => {
					this.snackbarService.success('Great!', 'Thanks for your feedback');

					this.feedbackForm.enable();

					this.onToggleFeedbackForm(false);
				},
				error: () => this.feedbackForm.enable()
			});
		}
	}
}
