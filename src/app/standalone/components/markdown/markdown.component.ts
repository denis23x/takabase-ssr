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
import {
	MarkdownControlCode,
	MarkdownControlCropper,
	MarkdownControlEmojiMart,
	MarkdownControlFormatting,
	MarkdownControlHeading,
	MarkdownControlList,
	MarkdownControlQuote,
	MarkdownControlSpoiler,
	MarkdownControlTable,
	MarkdownControlUrl
} from './markdown';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { WindowComponent } from '../window/window.component';
import { InputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { InputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import {
	MarkdownControl,
	MarkdownShortcut,
	MarkdownTextarea,
	MarkdownWrapper,
	MarkdownWrapperPayload
} from '../../../core/models/markdown.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';
import { AppearanceService } from '../../../core/services/appearance.service';
import { FileService } from '../../../core/services/file.service';
import { BadgeErrorComponent } from '../badge-error/badge-error.component';

interface UrlForm {
	title?: FormControl<string>;
	url?: FormControl<string>;
}

/** https://www.markdownguide.org/basic-syntax/ */
/** https://markdown-it.github.io/ */

@Component({
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		SvgIconComponent,
		DropdownComponent,
		WindowComponent,
		InputTrimWhitespaceDirective,
		InputOnlyPasteDirective,
		BadgeErrorComponent
	],
	selector: 'app-markdown, [appMarkdown]',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements AfterViewInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly markdownService: MarkdownService = inject(MarkdownService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly fileService: FileService = inject(FileService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);

	@ViewChild('urlFormDialog') urlFormDialog: ElementRef<HTMLDialogElement> | undefined;

	@Output() appMarkdownDialogToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appMarkdownUploadToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	set appMarkdownScrollSync(scrollSync: boolean) {
		this.scrollSync = scrollSync;

		if (this.platformService.isBrowser()) {
			if (this.textarea) {
				this.textarea.dispatchEvent(new Event('scroll'));
			}
		}
	}

	@Input()
	set appMarkdownDisabled(disabled: boolean) {
		this.controlListDisabled = disabled;
	}

	@Input({ required: true })
	set appMarkdownTextareaId(markdownId: string) {
		this.textareaId = markdownId;
	}

	@Input({ required: true })
	set appMarkdownPreviewId(previewId: string) {
		this.previewId = previewId;
	}

	controlListHeading: MarkdownControl[] = MarkdownControlHeading();
	controlListFormatting: MarkdownControl[] = MarkdownControlFormatting();
	controlListList: MarkdownControl[] = MarkdownControlList();
	controlListQuote: MarkdownControl = MarkdownControlQuote();
	controlListUrl: MarkdownControl[] = MarkdownControlUrl();
	controlListCropper: MarkdownControl = MarkdownControlCropper();
	controlListEmojiMart: MarkdownControl = MarkdownControlEmojiMart();
	controlListEmojiMartColorScheme$: Subscription | undefined;
	controlListTable: MarkdownControl = MarkdownControlTable();
	controlListTableCells: number[] = [...Array(25).keys()];
	controlListSpoiler: MarkdownControl = MarkdownControlSpoiler();
	controlListCode: MarkdownControl = MarkdownControlCode();
	controlListDisabled: boolean = false;

	scrollSync: boolean = false;
	scrollSync$: Subscription | undefined;

	textareaShortcuts$: Subscription | undefined;
	textareaPaste$: Subscription | undefined;
	textareaPasteFileImage$: Subscription | undefined;
	textareaInput$: Subscription | undefined;
	textareaId: string | undefined;
	textarea: HTMLTextAreaElement | undefined;

	previewId: string | undefined;
	preview: HTMLElement | undefined;

	urlForm: FormGroup = this.formBuilder.group<UrlForm>({});
	urlForm$: Subscription | undefined;
	urlFormControl: MarkdownControl | undefined;

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			// @ts-ignore
			this.textarea = this.document.getElementById(this.textareaId);
			this.preview = this.document.getElementById(this.previewId);

			this.textareaInput$?.unsubscribe();
			this.textareaInput$ = fromEvent(this.textarea, 'input')
				.pipe(debounceTime(200))
				.subscribe({
					next: () => this.markdownService.setRender(this.textarea.value, this.preview),
					error: (error: any) => console.error(error)
				});

			/** Cropper call */

			this.textareaPaste$?.unsubscribe();
			this.textareaPaste$ = fromEvent(this.textarea, 'paste')
				.pipe(
					filter((clipboardEventInit: ClipboardEventInit) => {
						return !!clipboardEventInit.clipboardData.files.length;
					})
				)
				.subscribe({
					// prettier-ignore
					next: (clipboardEventInit: ClipboardEventInit) => this.markdownService.markdownItClipboard.next(clipboardEventInit),
					error: (error: any) => console.error(error)
				});

			/** Cropper call by paste */

			this.textareaPasteFileImage$?.unsubscribe();
			this.textareaPasteFileImage$ = this.markdownService.markdownItCropperImage.subscribe({
				next: (file: File) => {
					this.appMarkdownUploadToggle.emit(true);

					this.fileService.create(file, '/upload/post-images-markdown').subscribe({
						next: (fileUrl: string) => {
							const params: any = {
								title: Date.now(),
								url: fileUrl
							};

							this.appMarkdownUploadToggle.emit(false);

							/** Apply result */

							this.setTextareaValue(this.getTextareaValue(this.controlListCropper, params));
						},
						error: (error: any) => console.error(error)
					});
				},
				error: (error: any) => console.error(error)
			});

			/** Shortcuts */

			this.textareaShortcuts$?.unsubscribe();
			this.textareaShortcuts$ = this.markdownService.markdownItShortcut
				.pipe(
					map((markdownShortcut: MarkdownShortcut) => {
						const markdownControlList: MarkdownControl[] = [
							...this.controlListHeading,
							...this.controlListFormatting,
							...this.controlListList,
							...this.controlListUrl,
							this.controlListQuote,
							this.controlListCropper,
							this.controlListSpoiler,
							this.controlListCode
						];

						// prettier-ignore
						const markdownControl: MarkdownControl = markdownControlList.find((control: MarkdownControl) => {
              return control.key === markdownShortcut.key;
            });

						switch (markdownControl.key) {
							case 'url-link':
							case 'url-image':
							case 'url-youtube': {
								this.onToggleUrlForm(true, markdownControl);

								return null;
							}
							case 'cropper': {
								this.onControlListCropperClick();

								return null;
							}
							default: {
								return markdownControl;
							}
						}
					}),
					filter((markdownControl: MarkdownControl | null) => !!markdownControl),
					map((markdownControl: MarkdownControl) => this.getTextareaValue(markdownControl))
				)
				.subscribe({
					next: (value: string) => this.setTextareaValue(value),
					error: (error: any) => console.error(error)
				});
		}

		this.setHandlerEmojiMart();

		this.setHandlerScrollSync();
	}

	ngOnDestroy(): void {
		[
			this.textareaInput$,
			this.textareaPaste$,
			this.textareaPasteFileImage$,
			this.textareaShortcuts$,
			this.scrollSync$,
			this.urlForm$,
			this.controlListEmojiMartColorScheme$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	onControlListTableMouseEnter(mouseEvent: MouseEvent, event: string): void {
		const divElement: HTMLDivElement | null = this.document.querySelector('[data-control-table]');

		if (divElement) {
			// prettier-ignore
			if (event === 'enter') {
        const parentElement: DOMRect = (mouseEvent.target as HTMLElement).parentElement.getBoundingClientRect();
        const targetElement: DOMRect = (mouseEvent.target as HTMLElement).getBoundingClientRect();

        const width: string = 'width:' + Math.abs(parentElement.left - targetElement.right) + 'px;';
        const height: string = 'height:' + Math.abs(parentElement.top - targetElement.bottom) + 'px;';

        /** Apply styles */

        divElement.setAttribute('style', width + height);
			}

			if (event === 'leave') {
				divElement.removeAttribute('style');
			}
		}
	}

	onControlListCropperClick(): void {
		this.markdownService.markdownItCropperToggle.next(true);
	}

	/** Extra handlers */

	setHandlerEmojiMart(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			/** Prepare theme colors */

			const setThemeColor = (): void => {
				const variablesCSSMap: string[] = ['--p', '--b1', '--bc'];

				variablesCSSMap.forEach((variable: string) => {
					const rgb: string = this.appearanceService.getCSSColor(variable, 'rgb');

					const propertyKey: string = [variable, 'rgb'].join('-');
					const propertyValue: string = rgb.match(/(\d*\.?\d*%)/gm).join(' ');

					this.document.documentElement.style.setProperty(propertyKey, propertyValue);
				});
			};

			this.controlListEmojiMartColorScheme$?.unsubscribe();
			this.controlListEmojiMartColorScheme$ = this.appearanceService
				.getPrefersColorScheme()
				.subscribe({
					next: () => setThemeColor(),
					error: (error: any) => console.error(error)
				});

			// Initial call

			setThemeColor();

			/** Init Emoji Mart */

			// @ts-ignore
			const emojiMartPicker: any = new window.EmojiMart.Picker({
				/** https://github.com/rickstaa/github-emoji-picker */

				data: async () => {
					return fetch('/assets/emoji/github_emojis.json').then((response: Response) => {
						return response.json();
					});
				},
				onEmojiSelect: (event: any) => {
					const markdownControl: MarkdownControl = {
						...this.controlListEmojiMart,
						handler: () => event.shortcodes
					};

					this.setTextareaValue(this.getTextareaValue(markdownControl));
				},
				maxFrequentRows: 3,
				perLine: 8,
				set: 'native',
				locale: 'en',
				navPosition: 'top',
				skinTonePosition: 'preview',
				previewPosition: 'bottom'
			});

			this.document.getElementById('emojiMartPicker').appendChild(emojiMartPicker);
		}
	}

	setHandlerScrollSync(): void {
		if (this.platformService.isBrowser()) {
			// prettier-ignore
			const getScrollTop = (a: HTMLElement, b: HTMLElement): number => {
        return Math.round((b.scrollHeight - b.clientHeight) * ((a.scrollTop / (a.scrollHeight - a.clientHeight))))
      }

			this.scrollSync$?.unsubscribe();
			this.scrollSync$ = merge(
				fromEvent(this.textarea, 'scroll'),
				fromEvent(this.preview, 'scroll')
			)
				.pipe(filter(() => this.scrollSync))
				.subscribe({
					next: (event: Event) => {
						const source: any = event.target;

						if (source.id === this.textarea.id) {
							this.preview.scrollTop = getScrollTop(this.textarea, this.preview);
						}

						if (source.id === this.preview.id) {
							this.textarea.scrollTop = getScrollTop(this.preview, this.textarea);
						}
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	/** Textarea */

	getTextareaMarkdown(textareaElement: HTMLTextAreaElement): MarkdownTextarea {
		const { selectionStart, selectionEnd, value }: Record<string, any> = textareaElement;

		const getWrapperPayload = (payload: string): MarkdownWrapperPayload => {
			return {
				space: !!payload.length && payload === ' ',
				newline: !!payload.length && payload === '\n',
				character: !!payload.length && payload !== ' ' && payload !== '\n'
			};
		};

		const wrapper: MarkdownWrapper = {
			before: getWrapperPayload(value.substring(0, selectionStart).slice(-1)),
			after: getWrapperPayload(value.substring(selectionEnd, value.length).slice(0, 1))
		};

		return {
			selection: value.substring(selectionStart, selectionEnd).trim(),
			selectionStart,
			selectionEnd,
			wrapper,
			value
		};
	}

	getTextareaValue(markdownControl: MarkdownControl, params?: any): string {
		const markdownTextarea: MarkdownTextarea = this.getTextareaMarkdown(this.textarea);

		const selectionStart: number = markdownTextarea.selectionStart;
		const selectionEnd: number = markdownTextarea.selectionEnd;

		const before: string = markdownTextarea.value.substring(0, selectionStart);
		const after: string = markdownTextarea.value.substring(selectionEnd);
		const value: string = markdownControl.handler(markdownTextarea, params);

		return before + value + after;
	}

	setTextareaValue(value: string): void {
		const difference: number = value.length - this.textarea.value.length;

		const selectionStart: number = this.textarea.selectionStart + difference;
		const selectionEnd: number = this.textarea.selectionEnd + difference;

		this.textarea.value = value;
		this.textarea.dispatchEvent(new Event('input', { bubbles: true }));

		// prettier-ignore
		this.textarea.selectionStart = selectionStart !== selectionEnd ? selectionEnd : selectionStart
		this.textarea.selectionEnd = selectionEnd;
		this.textarea.focus();
	}

	/** urlForm */

	onToggleUrlForm(toggle: boolean, markdownControl?: MarkdownControl): void {
		if (toggle) {
			/** Build dynamic form */

			// prettier-ignore
			switch (markdownControl.key) {
        case "url-link": {
          this.urlForm.addControl("title", this.formBuilder.nonNullable.control("", [Validators.required]))
          this.urlForm.addControl("url", this.formBuilder.nonNullable.control("", [Validators.required, Validators.pattern(this.helperService.getRegex("url"))]))

          const abstractControlTitle: AbstractControl = this.urlForm.get("title")
          const abstractControlUrl: AbstractControl = this.urlForm.get("url")

          this.urlForm$?.unsubscribe()
          this.urlForm$ = abstractControlUrl.valueChanges
            .pipe(filter(() => abstractControlTitle.untouched))
            .subscribe((value: string) => abstractControlTitle.setValue(value))

          break
        }
        case "url-image": {
          this.urlForm.addControl("title", this.formBuilder.nonNullable.control("", []))
          this.urlForm.addControl("url", this.formBuilder.nonNullable.control("", [Validators.required, Validators.pattern(this.helperService.getRegex("url"))]))

          break
        }
        case "url-youtube": {
          this.urlForm.addControl("url", this.formBuilder.nonNullable.control("", [Validators.required, Validators.pattern(this.helperService.getRegex("youtube"))]))

          break
        }
        default: {
          break
        }
      }

			/** Apply selection */

			const markdownTextarea: MarkdownTextarea = this.getTextareaMarkdown(this.textarea);

			if (markdownTextarea.selection) {
				Object.keys(this.urlForm.controls).forEach((key: string) => {
					const abstractControl: AbstractControl = this.urlForm.get(key);

					abstractControl.setValue(markdownTextarea.selection);

					if (abstractControl.valid) {
						abstractControl.markAsTouched();
					} else {
						abstractControl.reset();
					}
				});
			}

			this.urlFormControl = markdownControl;
			this.urlFormDialog.nativeElement.showModal();
		} else {
			Object.keys(this.urlForm.controls).forEach((key: string) => {
				this.urlForm.removeControl(key);
			});

			this.urlForm$?.unsubscribe();
			this.urlFormControl = undefined;
			this.urlFormDialog.nativeElement.close();
		}

		this.appMarkdownDialogToggle.emit(toggle);
	}

	onSubmitUrlForm(): void {
		if (this.helperService.getFormValidation(this.urlForm)) {
			/** Set value */

			this.urlForm.disable();

			this.setTextareaValue(this.getTextareaValue(this.urlFormControl, this.urlForm.value));

			/** Clear urlForm && emit modalToggle  */

			this.urlForm.enable();

			this.onToggleUrlForm(false);
		}
	}
}
