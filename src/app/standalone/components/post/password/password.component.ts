/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { Location } from '@angular/common';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import type { Post } from '../../../../core/models/post.model';

interface PostPasswordForm {
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent, BadgeErrorComponent, InputTrimWhitespaceDirective, ReactiveFormsModule],
	selector: 'app-post-password, [appPostPassword]',
	templateUrl: './password.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostPasswordComponent implements OnInit {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	@ViewChild('postPasswordDialogElement') postPasswordDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostPasswordSuccess: EventEmitter<string> = new EventEmitter<string>();
	@Output() appPostPasswordToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	post: Post | undefined;
	postPasswordForm: FormGroup = this.formBuilder.group<PostPasswordForm>({
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	postPasswordDialogToggle: boolean = true;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onTogglePostPasswordDialog(false));
		}
	}

	onTogglePostPasswordDialog(toggle: boolean): void {
		this.postPasswordDialogToggle = toggle;

		if (toggle) {
			this.postPasswordDialogElement.nativeElement.showModal();
		} else {
			this.postPasswordDialogElement.nativeElement.close();
		}

		this.appPostPasswordToggle.emit(toggle);
	}

	onSubmitPostPasswordForm(): void {
		this.appPostPasswordSuccess.emit(this.postPasswordForm.value.password);
	}
}
