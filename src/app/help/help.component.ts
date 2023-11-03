/** @format */

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../standalone/directives/app-textarea-resize.directive';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { WindowComponent } from '../standalone/components/window/window.component';
import { HelperService } from '../core/services/helper.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { AppAuthenticatedDirective } from '../standalone/directives/app-authenticated.directive';
import { AppSkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';

interface HelpForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AppScrollPresetDirective,
		SvgIconComponent,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		ReactiveFormsModule,
		WindowComponent,
		AppAuthenticatedDirective,
		AppSkeletonDirective,
		DropdownComponent
	],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	@ViewChild('helpFormDialog') helpFormDialog: ElementRef<HTMLDialogElement> | undefined;

	helpForm: FormGroup | undefined;

	helpFormNameList: string[] = [
		'Terms and conditions',
		'Sex, sexuality and nudity',
		'Spam Everywhere',
		'Time spent waiting',
		'Technical glitch'
	];

	helpNavigationList: any[] = [
		{
			path: 'about',
			name: 'About'
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
		private metaService: MetaService
	) {
		this.helpForm = this.formBuilder.group<HelpForm>({
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
		/** Apply Data */

		// Nothing to apply

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

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}

	onToggleHelpForm(toggle: boolean): void {
		if (toggle) {
			this.helpFormDialog.nativeElement.showModal();
		} else {
			this.helpFormDialog.nativeElement.close();
		}

		this.helpForm.reset();
	}

	onSelectHelpFormName(helpFormName: string): void {
		const abstractControl: AbstractControl = this.helpForm.get('name');

		abstractControl.setValue(helpFormName);
		abstractControl.updateValueAndValidity();
	}

	onSubmitHelpForm(): void {
		if (this.helperService.getFormValidation(this.helpForm)) {
			this.helpForm.disable();

			// const helpCreateDto: HelpCreateDto = {
			// 	...this.helpForm.value
			// };
			//
			// this.helpService.create(helpCreateDto).subscribe({
			// 	next: () => {
			// 		this.snackbarService.success('Great!', 'Thanks for your feedback');
			//
			// 		this.helpForm.enable();
			//
			// 		this.onToggleHelpForm(false);
			// 	},
			// 	error: () => this.helpForm.enable()
			// });
		}
	}
}
