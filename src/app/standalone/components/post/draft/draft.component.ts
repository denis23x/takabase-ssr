/** @format */

import {
	AfterViewInit,
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
import { debounceTime } from 'rxjs/operators';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';

interface PostDraftForm {
	name: FormControl<string>;
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
export class PostDraftComponent implements AfterViewInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

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

	postDraftList: any[] = [];
	postDraftForm: FormGroup = this.formBuilder.group<PostDraftForm>({
		name: this.formBuilder.nonNullable.control('', [Validators.required])
	});
	postDraftDialogToggle: boolean = false;

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

			// Start only if there is no post to update

			if (!postId) {
				const window: Window = this.platformService.getWindow();

				this.postDraftList = Object.keys(window.localStorage)
					.filter((key: string) => key.startsWith('draft'))
					.map((key: string) => {
						const postDraftName: string[] = key.split('-');

						return {
							id: key,
							name: postDraftName.slice(2).join(' '),
							postType: postDraftName.slice(1, 2).pop()
						};
					});

				// Show dialog

				this.onTogglePostDraftDialog(!!this.postDraftList.length);

				// Start watcher

				this.postForm$?.unsubscribe();
				this.postForm$ = this.postForm.valueChanges.pipe(pairwise(), debounceTime(1000)).subscribe({
					next: ([previousValue, nextValue]: any[]) => {
						const abstractControl: AbstractControl = this.postForm.get('name');
						const abstractControlIsValid: boolean = !abstractControl.invalid;

						const lsKey = (value: string): string => ['draft', this.postType, ...value.split(' ')].join('-');
						const lsValue: string = JSON.stringify(nextValue);
						const lsValueEncrypted: string = this.helperService.getEncrypt(lsValue);

						if (abstractControlIsValid) {
							this.localStorageService.removeItem(lsKey(previousValue.name));
							this.localStorageService.setItem(lsKey(nextValue.name), lsValueEncrypted);
						}
					},
					error: (error: any) => console.error(error)
				});
			}
		}
	}

	ngOnDestroy(): void {
		[this.postForm$].forEach(($: Subscription) => $?.unsubscribe());
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
			const abstractControl: AbstractControl = this.postDraftForm.get('name');

			const draftId: string = abstractControl.value;
			const draft: any = this.postDraftList.find((draft: any) => draft.id === draftId);

			const lsValue: string = this.localStorageService.getItem(draftId);
			const lsValueDecrypted: string = this.helperService.getDecrypt(lsValue);

			const postType: string = draft.postType;
			const postForm: any = JSON.parse(lsValueDecrypted);

			// Emit to parent

			this.appPostDraftSuccess.emit({
				postType,
				postForm
			});

			this.onTogglePostDraftDialog(false);
		}
	}
}
