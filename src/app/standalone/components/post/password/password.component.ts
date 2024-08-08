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
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { Location } from '@angular/common';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostPasswordService } from '../../../../core/services/post-password.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { CookiesService } from '../../../../core/services/cookies.service';
import type { Post } from '../../../../core/models/post.model';
import type { PostGetOneDto } from '../../../../core/dto/post/post-get-one.dto';

interface PostPasswordForm {
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent, BadgeErrorComponent, InputTrimWhitespaceDirective, ReactiveFormsModule],
	providers: [PostPasswordService],
	selector: 'app-post-password, [appPostPassword]',
	templateUrl: './password.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostPasswordComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly location: Location = inject(Location);

	@ViewChild('postPasswordDialogElement') postPasswordDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostPasswordSuccess: EventEmitter<Post> = new EventEmitter<Post>();
	@Output() appPostPasswordToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	postPasswordForm: FormGroup = this.formBuilder.group<PostPasswordForm>({
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	postPasswordRequest$: Subscription | undefined;
	postPasswordDialogToggle: boolean = true;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onTogglePostPasswordDialog(false));
		}
	}

	ngOnDestroy(): void {
		[this.postPasswordRequest$].forEach(($: Subscription) => $?.unsubscribe());
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
		if (this.helperService.getFormValidation(this.postPasswordForm)) {
			this.postPasswordForm.disable();

			const postPasswordId: number = Number(this.activatedRoute.snapshot.paramMap.get('postPasswordId'));
			const postPasswordGetOneDto: PostGetOneDto = {
				...this.postPasswordForm.value,
				scope: ['user']
			};

			this.postPasswordRequest$?.unsubscribe();
			this.postPasswordRequest$ = this.postPasswordService.getOne(postPasswordId, postPasswordGetOneDto).subscribe({
				next: (postPassword: Post) => {
					const cookieKey: string = 'post-password-' + postPasswordId;
					const cookieValue: string = this.helperService.getEncrypt(postPasswordGetOneDto.password);

					this.cookiesService.setItem(cookieKey, cookieValue);

					// Emit post password

					this.snackbarService.success('Well..', 'Access granted');

					this.appPostPasswordSuccess.emit(postPassword);

					this.onTogglePostPasswordDialog(false);
				},
				error: () => this.postPasswordForm.enable()
			});
		}
	}
}
