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
	getWrapper,
	getSelectionEnd,
	getSelectionStart,
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
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
	MarkdownWrapper
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

	@Input({ required: true })
	set appMarkdownFullscreenId(fullscreenId: string) {
		this.fullscreenId = fullscreenId;
	}

	@Input({ required: true })
	set appMarkdownFullscreenToggle(fullscreenToggle: boolean) {
		this.fullscreenToggle = fullscreenToggle;
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

	fullscreenId: string | undefined;
	fullscreenToggle: boolean = false;
	fullscreenTextareaFocus$: Subscription | undefined;
	fullscreenTextareaBlur$: Subscription | undefined;
	fullscreenTextareaHeight: string | undefined;

	urlForm: FormGroup = this.formBuilder.group<UrlForm>({});
	urlForm$: Subscription | undefined;
	urlFormControl: MarkdownControl | undefined;

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			this.textarea = this.document.getElementById(this.textareaId) as HTMLTextAreaElement;
			this.preview = this.document.getElementById(this.previewId);

			this.textareaInput$?.unsubscribe();
			this.textareaInput$ = fromEvent(this.textarea, 'input')
				.pipe(debounceTime(100))
				.subscribe({
					next: () => {
						const hasValue: boolean = this.textarea.value !== '';
						const hasPreview: boolean = this.preview.innerHTML !== '';

						this.markdownService.setRender(this.textarea.value, this.preview);

						// Scroll to top when initialize

						if (hasValue && !hasPreview) {
							this.textarea.scrollTop = 0;
							this.preview.scrollTop = 0;
						}
					},
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

					this.fileService
						.create(file)
						.pipe(map((fileUrl: string) => this.fileService.getFileUrlClean(fileUrl)))
						.subscribe({
							next: (fileUrl: string) => {
								const params: any = {
									title: Date.now(),
									url: fileUrl
								};

								this.appMarkdownUploadToggle.emit(false);

								/** Apply result */

								this.setTextareaValue(this.getTextareaValue(this.controlListCropper, params));
							},
							error: () => this.appMarkdownUploadToggle.emit(false)
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

						const markdownControl: MarkdownControl = markdownControlList.find((control: MarkdownControl) => {
							return control.key === markdownShortcut.key;
						});

						switch (markdownControl.key) {
							case 'url-link':
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

		/** Extra handlers */

		this.setHandlerEmojiMart();

		this.setHandlerScrollSync();

		this.setHandlerFullscreen();
	}

	ngOnDestroy(): void {
		[
			this.textareaInput$,
			this.textareaPaste$,
			this.textareaPasteFileImage$,
			this.textareaShortcuts$,
			this.scrollSync$,
			this.urlForm$,
			this.controlListEmojiMartColorScheme$,
			this.fullscreenTextareaFocus$,
			this.fullscreenTextareaBlur$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	onControlListTableMouseEnter(mouseEvent: MouseEvent, event: string): void {
		const divElement: HTMLDivElement | null = this.document.querySelector('[data-control-table]');

		if (divElement) {
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
			this.controlListEmojiMartColorScheme$ = this.appearanceService.getPrefersColorScheme().subscribe({
				next: () => setThemeColor(),
				error: (error: any) => console.error(error)
			});

			// Initial call

			setThemeColor();

			/** https://github.com/rickstaa/github-emoji-picker */

			import('emoji-mart/dist/browser')
				.then(() => {
					// @ts-ignore
					const emojiMartPicker: any = new window.EmojiMart.Picker({
						data: async () => fetch('/assets/json/emojis.json').then((response: Response) => response.json()),
						onEmojiSelect: (event: any) => {
							const markdownControl: MarkdownControl = {
								...this.controlListEmojiMart,
								handler: () => event.shortcodes
							};

							this.setTextareaValue(this.getTextareaValue(markdownControl), false);
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
				})
				.catch((error: any) => console.error(error));
		}
	}

	setHandlerScrollSync(): void {
		if (this.platformService.isBrowser()) {
			const getScrollTop = (a: HTMLElement, b: HTMLElement): number => {
				return Math.round((b.scrollHeight - b.clientHeight) * (a.scrollTop / (a.scrollHeight - a.clientHeight)));
			};

			let scrollSourceId: string;
			let scrollSourceIdMatch: boolean;

			this.scrollSync$?.unsubscribe();
			this.scrollSync$ = merge(fromEvent(this.textarea, 'scroll'), fromEvent(this.preview, 'scroll'))
				.pipe(
					filter(() => this.scrollSync),
					map((event: Event) => event.target as HTMLElement)
				)
				.subscribe({
					next: (htmlElement: HTMLElement) => {
						scrollSourceIdMatch = scrollSourceId === htmlElement.id;
						scrollSourceId = htmlElement.id;

						if (scrollSourceIdMatch) {
							if (scrollSourceId === this.textarea.id) {
								this.preview.scrollTop = getScrollTop(this.textarea, this.preview);
							}

							if (scrollSourceId === this.preview.id) {
								this.textarea.scrollTop = getScrollTop(this.preview, this.textarea);
							}
						}
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	setHandlerFullscreen(): void {
		const fullscreenElement: HTMLElement = this.document.getElementById(this.fullscreenId);

		this.fullscreenTextareaFocus$?.unsubscribe();
		this.fullscreenTextareaFocus$ = fromEvent(this.textarea, 'focus')
			.pipe(filter(() => this.fullscreenToggle && this.platformService.isMobile()))
			.subscribe({
				next: () => {
					if (!this.fullscreenTextareaHeight) {
						const fullscreenDOMRect: DOMRect = this.textarea.getBoundingClientRect();
						const fullscreenTextareaHeight: number = fullscreenDOMRect.height + fullscreenDOMRect.top * 2;

						this.fullscreenTextareaHeight = fullscreenTextareaHeight + 'px';
					}

					fullscreenElement.style.height = this.fullscreenTextareaHeight;
				},
				error: (error: any) => console.error(error)
			});

		this.fullscreenTextareaBlur$?.unsubscribe();
		this.fullscreenTextareaBlur$ = fromEvent(this.textarea, 'blur')
			.pipe(filter(() => this.fullscreenToggle && this.platformService.isMobile()))
			.subscribe({
				next: () => fullscreenElement.style.removeProperty('height'),
				error: (error: any) => console.error(error)
			});
	}

	/** Textarea */

	getTextareaMarkdown(textareaElement: HTMLTextAreaElement): MarkdownTextarea {
		const value: string = textareaElement.value;
		const selectionStart: number = textareaElement.selectionStart;
		const selectionEnd: number = textareaElement.selectionEnd;

		const wrapper: MarkdownWrapper = {
			before: getWrapper(value.substring(0, selectionStart).slice(-1)),
			after: getWrapper(value.substring(selectionEnd, value.length).slice(0, 1))
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
		const value: string = markdownControl.handler(markdownTextarea, markdownControl.type, params);

		if (markdownControl.type === 'block') {
			const beforeTrimmed: string = before.endsWith(' ') ? before.trimEnd() : before;
			const afterTrimmed: string = after.startsWith(' ') ? after.trimStart() : after;

			return beforeTrimmed + value + afterTrimmed;
		} else {
			return before + value + after;
		}
	}

	setTextareaValue(value: string, setSelectionRange: boolean = true): void {
		const difference: number = value.length - this.textarea.value.length;
		const scrollTop: number = this.textarea.scrollTop;

		const selectionStart: number = getSelectionStart(value, this.textarea.selectionStart);
		const selectionEnd: number = getSelectionEnd(value, this.textarea.selectionEnd + difference);

		this.textarea.value = value;
		this.textarea.dispatchEvent(new Event('input'));

		this.textarea.focus();
		this.textarea.setSelectionRange(setSelectionRange ? selectionStart : selectionEnd, selectionEnd);
		this.textarea.scrollTop = scrollTop;
	}

	/** urlForm */

	onToggleUrlForm(toggle: boolean, markdownControl?: MarkdownControl): void {
		if (toggle) {
			/** Build dynamic form */

			// prettier-ignore
			switch (markdownControl.key) {
				case 'url-link': {
					this.urlForm.addControl('title', this.formBuilder.nonNullable.control('', [Validators.required]));
					this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [
						Validators.required,
						Validators.pattern(this.helperService.getRegex('url'))
					]));

					const abstractControlTitle: AbstractControl = this.urlForm.get('title');
					const abstractControlUrl: AbstractControl = this.urlForm.get('url');

					this.urlForm$?.unsubscribe();
					this.urlForm$ = abstractControlUrl.valueChanges
						.pipe(filter(() => abstractControlTitle.untouched))
						.subscribe((value: string) => abstractControlTitle.setValue(value));

					break;
				}
				case 'url-youtube': {
					this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [
						Validators.required,
						Validators.pattern(this.helperService.getRegex('youtube'))
					]));

					break;
				}
				default: {
					throw new Error('Invalid control key specified: ' + markdownControl.key);
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
