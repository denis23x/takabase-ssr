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
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
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

	postDraftKey: string | undefined;
	postDraftList: PostDraft[] = [];
	postDraftForm: FormGroup = this.formBuilder.group<PostDraftForm>({
		key: this.formBuilder.nonNullable.control('', [Validators.required])
	});
	postDraftDialogToggle: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();
			const windowLocalStorageDraftList: PostDraft[] = [];

			Object.keys(window.localStorage)
				.filter((key: string) => key.startsWith('draft'))
				.forEach((key: string) => {
					const lsValue: string = this.localStorageService.getItem(key);
					const lsValueDecrypted: string = this.helperService.getDecrypt(lsValue);
					const lsValuePostDraft: PostDraft = JSON.parse(lsValueDecrypted);

					if (dayjs().isBefore(dayjs(lsValuePostDraft.expiredAt))) {
						windowLocalStorageDraftList.push({ key, ...lsValuePostDraft });
					} else {
						this.onDeletePostDraft(key);
					}
				});

			this.postDraftList = windowLocalStorageDraftList;
			this.postDraftKey = ['draft', this.helperService.getNanoId(12)].join('-');

			// Start

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
							expiredAt: dayjs().add(20, 'minute').toString()
						};

						const lsKey: string = this.postDraftKey;
						const lsValue: string = this.helperService.getEncrypt(JSON.stringify(postDraft));

						this.localStorageService.setItem(lsKey, lsValue);
					},
					error: (error: any) => console.error(error)
				});

			// ExpressionChangedAfterItHasBeenCheckedError (PostDraftComponent)

			this.changeDetectorRef.detectChanges();
		}
	}

	ngOnDestroy(): void {
		[this.postForm$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onDeletePostDraft(key: string): void {
		this.postDraftList = this.postDraftList.filter((postDraft: PostDraft) => postDraft.key !== key);
		this.postDraftForm.reset();

		// Clear localStorage

		this.localStorageService.removeItem(key);
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
			const postDraftKey: string = this.postDraftForm.get('key').value;
			const postDraft: PostDraft = this.postDraftList.find((postDraft: PostDraft) => postDraft.key === postDraftKey);

			this.onDeletePostDraft(postDraftKey);
			this.onTogglePostDraftDialog(false);

			// Emit to parent

			this.appPostDraftSuccess.emit(postDraft);
		}
	}
}
