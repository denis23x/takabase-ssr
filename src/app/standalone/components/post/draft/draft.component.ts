/** @format */

import {
	ChangeDetectorRef,
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
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { HelperService } from '../../../../core/services/helper.service';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { debounceTime, filter } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import type { PostDraft } from '../../../../core/models/post-draft.model';
import type { PostType } from '../../../../core/models/post.model';

interface PostDraftForm {
	key: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		ReactiveFormsModule,
		BadgeErrorComponent,
		SkeletonDirective
	],
	selector: 'app-post-draft, [appPostDraft]',
	templateUrl: './draft.component.html'
})
export class PostDraftComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	@ViewChild('postDraftDialogElement') postDraftDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostDraftSuccess: EventEmitter<any> = new EventEmitter<any>();
	@Output() appPostDraftToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostDraftPostType(postType: PostType) {
		this.postType = postType;
	}

	@Input({ required: true })
	set appPostDraftPostForm(postForm: FormGroup) {
		this.postForm = postForm;
	}

	postType: PostType | undefined;
	postForm: FormGroup | undefined;
	postForm$: Subscription | undefined;

	postDraftList: PostDraft[] = [];
	postDraftActive: string | undefined;
	postDraftForm: FormGroup = this.formBuilder.group<PostDraftForm>({
		key: this.formBuilder.nonNullable.control('', [Validators.required])
	});
	postDraftDialogToggle: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postDraftUid: string = this.helperService.getNanoId(12);

			// Start only if there is no post to update

			if (!postId) {
				const window: Window = this.platformService.getWindow();

				Object.keys(window.localStorage)
					.filter((key: string) => key.startsWith('draft'))
					.forEach((key: string) => {
						const lsValue: string = this.localStorageService.getItem(key);
						const lsValueDecrypted: string = this.helperService.getDecrypt(lsValue);
						const lsValuePostDraft: PostDraft = JSON.parse(lsValueDecrypted);

						if (dayjs().isBefore(dayjs(lsValuePostDraft.expiredAt))) {
							this.postDraftList.push({ key, ...lsValuePostDraft });
						} else {
							this.localStorageService.removeItem(key);
						}
					});

				this.postDraftActive = ['draft', postDraftUid].join('-');

				// Start watcher

				this.onChangePostDraft();

				// ExpressionChangedAfterItHasBeenCheckedError (PostDraftComponent)

				this.changeDetectorRef.detectChanges();
			}
		}
	}

	ngOnDestroy(): void {
		[this.postForm$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onChangePostDraft(): void {
		this.postForm$?.unsubscribe();
		this.postForm$ = this.postForm.valueChanges
			.pipe(
				debounceTime(200),
				filter(() => this.postForm.get('name').valid),
				distinctUntilChanged()
			)
			.subscribe({
				next: (value: any) => {
					const postDraft: PostDraft = {
						postForm: value,
						postType: this.postType,
						expiredAt: dayjs().add(15, 'minute').toString()
					};

					const lsKey: string = this.postDraftActive;
					const lsValue: string = this.helperService.getEncrypt(JSON.stringify(postDraft));

					this.localStorageService.setItem(lsKey, lsValue);
				},
				error: (error: any) => console.error(error)
			});
	}

	onTogglePostDraftDialog(toggle: boolean): void {
		this.postDraftDialogToggle = toggle;

		if (toggle) {
			if (this.postDraftList.length) {
				this.postDraftDialogElement.nativeElement.showModal();
			}
		} else {
			this.postDraftDialogElement.nativeElement.close();
		}

		this.appPostDraftToggle.emit(toggle);
	}

	onSubmitPostDraftForm(): void {
		if (this.helperService.getFormValidation(this.postDraftForm)) {
			const abstractControl: AbstractControl = this.postDraftForm.get('key');
			const abstractControlValue: string = abstractControl.value;

			const lsValue: string = this.localStorageService.getItem(abstractControlValue);
			const lsValueDecrypted: string = this.helperService.getDecrypt(lsValue);

			// Set active

			this.postDraftActive = abstractControlValue;

			// Emit to parent

			this.appPostDraftSuccess.emit(JSON.parse(lsValueDecrypted));

			this.onTogglePostDraftDialog(false);
		}
	}
}
