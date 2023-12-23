/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnDestroy,
	Output,
	ViewChild
} from '@angular/core';
import {
	MarkdownControlCode,
	MarkdownControlEmojiMart,
	MarkdownControlFormatting,
	MarkdownControlHeading,
	MarkdownControlList,
	MarkdownControlSpoiler,
	MarkdownControlTable,
	MarkdownControlUrl
} from './markdown-controls';
import { EMPTY, fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter, startWith } from 'rxjs/operators';
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
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import {
	MarkdownControl,
	MarkdownTextarea,
	MarkdownWrapper,
	MarkdownWrapperPayload
} from '../../../core/models/markdown.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';
import { AppearanceService } from '../../../core/services/appearance.service';

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
		AppInputTrimWhitespaceDirective,
		AppInputOnlyPasteDirective
	],
	selector: 'app-markdown, [appMarkdown]',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements AfterViewInit, OnDestroy {
	// prettier-ignore
	@ViewChild("controlListTableElement") controlListTableElement: ElementRef<HTMLDivElement> | undefined
	@ViewChild('controlListElement') controlListElement: ElementRef<HTMLDivElement> | undefined;

	@ViewChild('dropdownHeading') dropdownHeading: DropdownComponent | undefined;
	@ViewChild('dropdownFormatting') dropdownFormatting: DropdownComponent | undefined;
	@ViewChild('dropdownList') dropdownList: DropdownComponent | undefined;
	@ViewChild('dropdownEmojiMart') dropdownEmojiMart: DropdownComponent | undefined;
	@ViewChild('dropdownTable') dropdownTable: DropdownComponent | undefined;

	@ViewChild('urlFormDialog') urlFormDialog: ElementRef<HTMLDialogElement> | undefined;

	@Output() appMarkdownDialogToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

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
	controlListUrl: MarkdownControl[] = MarkdownControlUrl();
	controlListEmojiMart: MarkdownControl = MarkdownControlEmojiMart();
	controlListEmojiMartColorScheme$: Subscription | undefined;
	controlListTable: MarkdownControl = MarkdownControlTable();
	controlListSpoiler: MarkdownControl = MarkdownControlSpoiler();
	controlListCode: MarkdownControl = MarkdownControlCode();
	controlListScroll$: Subscription | undefined;
	controlListDisabled: boolean = false;

	scrollSync: boolean = false;
	scrollSync$: Subscription | undefined;

	textareaPaste$: Subscription | undefined;
	textareaInput$: Subscription | undefined;
	textareaId: string | undefined;
	textarea: HTMLTextAreaElement | undefined;

	previewId: string | undefined;
	preview: HTMLElement | undefined;

	urlForm: FormGroup | undefined;
	urlForm$: Subscription | undefined;
	urlFormControl: MarkdownControl | undefined;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private markdownService: MarkdownService,
		private platformService: PlatformService,
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private appearanceService: AppearanceService
	) {
		this.urlForm = this.formBuilder.group<UrlForm>({});
	}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			// @ts-ignore
			this.textarea = this.document.getElementById(this.textareaId);
			this.preview = this.document.getElementById(this.previewId);

			this.textareaInput$?.unsubscribe();
			this.textareaInput$ = fromEvent(this.textarea, 'input')
				.pipe(startWith(EMPTY), debounceTime(200))
				.subscribe({
					next: () => this.markdownService.setRender(this.textarea.value, this.preview),
					error: (error: any) => console.error(error)
				});

			this.textareaPaste$?.unsubscribe();
			this.textareaPaste$ = fromEvent(this.textarea, 'paste').subscribe({
				// prettier-ignore
				next: (clipboardEventInit: ClipboardEventInit) => this.markdownService.markdownItClipboard.next(clipboardEventInit),
				error: (error: any) => console.error(error)
			});
		}

		this.setEmojiMart();

		this.setDropdownHandler();

		this.setScrollSyncHandler();
	}

	ngOnDestroy(): void {
		[
			this.textareaInput$,
			this.textareaPaste$,
			this.scrollSync$,
			this.controlListScroll$,
			this.urlForm$,
			this.controlListEmojiMartColorScheme$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setEmojiMart(): void {
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

	onTableMouseEnter(mouseEvent: MouseEvent): void {
		// prettier-ignore
		const parentElement: DOMRect = (mouseEvent.target as HTMLElement).parentElement.getBoundingClientRect()
		const targetElement: DOMRect = (mouseEvent.target as HTMLElement).getBoundingClientRect();

		const width: string = 'width:' + Math.abs(parentElement.left - targetElement.right) + 'px;';
		const height: string = 'height:' + Math.abs(parentElement.top - targetElement.bottom) + 'px;';

		this.controlListTableElement.nativeElement.setAttribute('style', width + height);
	}

	setDropdownHandler(): void {
		const dropdownComponentList: DropdownComponent[] = [
			this.dropdownHeading,
			this.dropdownFormatting,
			this.dropdownList,
			this.dropdownEmojiMart,
			this.dropdownTable
		];

		const dropdownComponent = (): DropdownComponent | undefined => {
			return dropdownComponentList.find((dropdownComponent: DropdownComponent) => {
				return dropdownComponent.dropdownState;
			});
		};

		const controlListElement: any = this.controlListElement.nativeElement;

		this.controlListScroll$?.unsubscribe();
		this.controlListScroll$ = fromEvent(controlListElement, 'scroll')
			.pipe(filter(() => !!dropdownComponent()))
			.subscribe({
				next: () => dropdownComponent().setStateStyle(false),
				error: (error: any) => console.error(error)
			});
	}

	setScrollSyncHandler(): void {
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

	getMarkdownTextarea(textareaElement: HTMLTextAreaElement): MarkdownTextarea {
		const { selectionStart, selectionEnd, value }: Record<string, any> = textareaElement;

		const getWrapperPayload = (value: string): MarkdownWrapperPayload => {
			return {
				space: !!value.length && value === ' ',
				newline: !!value.length && value === '\n',
				character: !!value.length && value !== ' ' && value !== '\n'
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
		const markdownTextarea: MarkdownTextarea = this.getMarkdownTextarea(this.textarea);

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

			const markdownTextarea: MarkdownTextarea = this.getMarkdownTextarea(this.textarea);

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
			// prettier-ignore
			Object.keys(this.urlForm.controls).forEach((key: string) => this.urlForm.removeControl(key))

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
