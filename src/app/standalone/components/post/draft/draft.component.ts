/** @format */

import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	Output,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { pairwise, Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { HelperService } from '../../../../core/services/helper.service';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { debounceTime, filter } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import type { PostDraft } from '../../../../core/models/post-draft.model';

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
		SkeletonDirective,
		DayjsPipe
	],
	selector: 'app-post-draft, [appPostDraft]',
	templateUrl: './draft.component.html'
})
export class PostDraftComponent implements AfterViewInit, OnDestroy {
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
	set appPostDraftPostType(postType: string) {
		this.postType = postType;
	}

	@Input({ required: true })
	set appPostDraftPostForm(postForm: FormGroup) {
		this.postForm = postForm;
	}

	postType: string | undefined;
	postForm: FormGroup | undefined;
	postForm$: Subscription | undefined;

	postDraftList: PostDraft[] = [];
	postDraftForm: FormGroup = this.formBuilder.group<PostDraftForm>({
		key: this.formBuilder.nonNullable.control('', [Validators.required])
	});
	postDraftDialogToggle: boolean = false;

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

			// Start only if there is no post to update

			if (!postId) {
				const window: Window = this.platformService.getWindow();

				// Getter

				Object.keys(window.localStorage)
					.filter((key: string) => key.startsWith('draft'))
					.forEach((key: string) => {
						const lsValue: string = this.localStorageService.getItem(key);
						const lsValueDecrypted: string = this.helperService.getDecrypt(lsValue);

						const postDraft: PostDraft = JSON.parse(lsValueDecrypted);
						const postDraftIsExpired: boolean = dayjs().isAfter(dayjs(postDraft.expiredAt));

						if (postDraftIsExpired) {
							this.onDeletePostDraft(key);
						} else {
							this.postDraftList.push({ key, ...postDraft });
						}
					});

				// Show dialog

				this.onTogglePostDraftDialog(!!this.postDraftList.length);

				// Start watcher

				this.postForm$?.unsubscribe();
				this.postForm$ = this.postForm.valueChanges
					.pipe(
						pairwise(),
						filter(() => this.postForm.get('name').valid),
						filter(([previousValue, nextValue]: any[]) => JSON.stringify(previousValue) !== JSON.stringify(nextValue)),
						debounceTime(500)
					)
					.subscribe({
						next: ([previousValue, nextValue]: any[]) => {
							const postDraft: PostDraft = {
								postForm: nextValue,
								postType: this.postType,
								expiredAt: dayjs().add(15, 'minute').toString()
							};

							const lsKey = (value: string): string => ['draft', ...value.split(' ')].join('-');
							const lsValueEncrypted: string = this.helperService.getEncrypt(JSON.stringify(postDraft));

							this.localStorageService.removeItem(lsKey(previousValue.name));
							this.localStorageService.setItem(lsKey(nextValue.name), lsValueEncrypted);
						},
						error: (error: any) => console.error(error)
					});

				// ExpressionChangedAfterItHasBeenCheckedError (PostDraftComponent)

				this.changeDetectorRef.detectChanges();
			}
		}
	}

	ngOnDestroy(): void {
		[this.postForm$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onDeletePostDraft(key: any): void {
		this.postDraftForm.reset();
		this.postDraftList = this.postDraftList.filter((postDraft: PostDraft) => {
			return postDraft.key !== key;
		});

		// Update localStorage

		this.localStorageService.removeItem(key);

		// Close dialog

		this.onTogglePostDraftDialog(!!this.postDraftList.length);
	}

	onTogglePostDraftDialog(toggle: boolean): void {
		this.postDraftDialogToggle = toggle;

		if (toggle) {
			this.postDraftDialogElement.nativeElement.showModal();
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

			// Emit to parent

			this.appPostDraftSuccess.emit(JSON.parse(lsValueDecrypted));

			this.onTogglePostDraftDialog(false);
		}
	}
}
