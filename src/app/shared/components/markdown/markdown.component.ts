/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	MarkdownControlHeading,
	MarkdownControlFormatting,
	MarkdownControlList,
	MarkdownControlUrl,
	MarkdownControlEmojiMart,
	MarkdownControlCode
} from './markdown-controls';
import { BehaviorSubject, fromEvent, merge, Subscription, EMPTY } from 'rxjs';
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
import { OverlayComponent } from '../overlay/overlay.component';
import { WindowComponent } from '../window/window.component';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import {
	MarkdownControl,
	MarkdownTextarea,
	MarkdownTextareaPayload,
	MarkdownTextareaPayloadSelection
} from '../../../core/models/markdown.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';

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
		OverlayComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		AppInputOnlyPasteDirective
	],
	selector: 'app-markdown, [appMarkdown]',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('controlListElement') controlListElement: ElementRef | undefined;

	@ViewChild('dropdownHeading') dropdownHeading: DropdownComponent | undefined;
	// prettier-ignore
	@ViewChild('dropdownFormatting') dropdownFormatting: DropdownComponent | undefined;
	@ViewChild('dropdownList') dropdownList: DropdownComponent | undefined;

	// prettier-ignore
	@ViewChild('dropdownEmojiMart') dropdownEmojiMart: DropdownComponent | undefined;

	@Input()
	set appScrollSync(scrollSync: boolean) {
		this.scrollSync = scrollSync;
	}

	@Input()
	set appDisabled(disabled: boolean) {
		this.controlListDisabled = disabled;
	}

	@Input()
	set appTextareaId(markdownId: string) {
		this.textareaId = markdownId;
	}

	@Input()
	set appPreviewId(previewId: string) {
		this.previewId = previewId;
	}

	controlListHeading: MarkdownControl[] = MarkdownControlHeading();
	controlListFormatting: MarkdownControl[] = MarkdownControlFormatting();
	controlListList: MarkdownControl[] = MarkdownControlList();
	controlListUrl: MarkdownControl[] = MarkdownControlUrl();
	controlListEmojiMart: MarkdownControl = MarkdownControlEmojiMart();
	controlListCode: MarkdownControl = MarkdownControlCode();
	controlListScroll$: Subscription | undefined;
	controlListDisabled: boolean = false;

	scrollSync: boolean = false;
	scrollSync$: Subscription | undefined;

	textareaInput$: Subscription | undefined;
	textareaId: string | undefined;
	textarea: HTMLTextAreaElement | undefined;
	textareaHistoryToggle: boolean = true;
	// prettier-ignore
	textareaHistory$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

	previewId: string | undefined;
	preview: HTMLElement | undefined;

	urlForm: FormGroup | undefined;
	urlFormControl: MarkdownControl | undefined;
	urlFormIsSubmitted: boolean = false;
	urlFormModal: boolean = false;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private markdownService: MarkdownService,
		private platformService: PlatformService,
		private formBuilder: FormBuilder,
		private helperService: HelperService
	) {
		this.urlForm = this.formBuilder.group<UrlForm>({});
	}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			// @ts-ignore
			this.textarea = this.document.getElementById(this.textareaId);
			this.preview = this.document.getElementById(this.previewId);

			this.textareaInput$ = fromEvent(this.textarea, 'input')
				.pipe(startWith(EMPTY), debounceTime(100))
				.subscribe({
					next: () => {
						this.markdownService.getRender(this.textarea.value, this.preview);

						if (this.textareaHistoryToggle) {
							// prettier-ignore
							this.textareaHistory$.next(this.textareaHistory$.getValue().concat([this.textarea.value]));
						} else {
							this.textareaHistoryToggle = true;
						}
					},
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
			this.textareaHistory$,
			this.scrollSync$,
			this.controlListScroll$
		].forEach($ => $?.unsubscribe());
	}

	setEmojiMart(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			/** https://www.30secondsofcode.org/js/s/hsl-to-rgb */

			const convertHSLToRGB = (h: number, s: number, l: number): number[] => {
				s /= 100;
				l /= 100;

				const k = (n: number): number => (n + h / 30) % 12;

				const a: number = s * Math.min(l, 1 - l);

				// prettier-ignore
				const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

				return [
					Math.round(255 * f(0)),
					Math.round(255 * f(8)),
					Math.round(255 * f(4))
				];
			};

			/** Prepare theme colors */

			const getCSSPropertyValue = (variable: string): string[] => {
				return window
					.getComputedStyle(this.document.documentElement)
					.getPropertyValue(variable)
					.trim()
					.split(/\s/g);
			};

			// prettier-ignore
			const setCSSProperty = (property: string, propertyValue: string): void => {
        this.document.documentElement.style.setProperty(property, propertyValue);
      };

			const variablesCSSMap: any[] = [
				{
					nameHSL: '--p',
					nameRGB: '--p-converted-to-rgb',
					nameWithComma: false
				},
				{
					nameHSL: '--b1',
					nameRGB: '--b1-converted-to-rgb',
					nameWithComma: false
				},
				{
					nameHSL: '--bc',
					nameRGB: '--bc-converted-to-rgb',
					nameWithComma: false
				},
				{
					nameHSL: '--bc',
					nameRGB: '--bc-converted-to-rgb-with-comma',
					nameWithComma: true
				}
			];

			variablesCSSMap.forEach((variable: any) => {
				// prettier-ignore
				const [h, s, l]: number[] = getCSSPropertyValue(variable.nameHSL).map((value: string) => Number(value.replace('%', '')));
				const [r, g, b]: number[] = convertHSLToRGB(h, s, l);

				const property: string = variable.nameRGB;

				// prettier-ignore
				const propertyValue: string = [r, g, b].join(variable.nameWithComma ? ',' : ' ');

				setCSSProperty(property, propertyValue);
			});

			/** Init Emoji Mart */

			// @ts-ignore
			const emojiMartPicker: any = new window.EmojiMart.Picker({
				/** https://github.com/rickstaa/github-emoji-picker */

				// prettier-ignore
				data: async () => fetch('/assets/github_emojis.json').then((response: Response) => response.json()),
				onEmojiSelect: (event: any) => {
					this.onMarkdownControl({
						...this.controlListEmojiMart,
						handler: () => event.shortcodes
					});
				},
				maxFrequentRows: 3,
				set: 'native'
			});

			this.document
				.getElementById('emojiMartPicker')
				.appendChild(emojiMartPicker);
		}
	}

	setDropdownHandler(): void {
		const dropdownComponentList: DropdownComponent[] = [
			this.dropdownHeading,
			this.dropdownFormatting,
			this.dropdownList,
			this.dropdownEmojiMart
		];

		// prettier-ignore
		const dropdownComponent = (): DropdownComponent | undefined => {
      return dropdownComponentList.find((dropdownComponent: DropdownComponent) => {
        return dropdownComponent.dropdownState;
      })
    };

		const controlListElement: any = this.controlListElement.nativeElement;

		this.controlListScroll$ = fromEvent(controlListElement, 'scroll')
			.pipe(filter(() => !!dropdownComponent()))
			.subscribe(() => dropdownComponent().setStateStyle(false));
	}

	setScrollSyncHandler(): void {
		const getScrollTop = (a: HTMLElement, b: HTMLElement): number => {
			// prettier-ignore
			return Math.round((b.scrollHeight - b.clientHeight) * ((a.scrollTop / (a.scrollHeight - a.clientHeight))));
		};

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

	onMarkdownBack(): void {
		const history: string[] = this.textareaHistory$.getValue().slice(0, -1);
		const historyValue: string = history[history.length - 1];

		this.textareaHistory$.next(history);
		this.textareaHistoryToggle = false;

		this.setTextareaValue(historyValue);
	}

	onMarkdownControl(markdownControl: MarkdownControl): void {
		if (markdownControl.key.includes('url')) {
			/** Build dynamic form */

			// prettier-ignore
			switch (markdownControl.key) {
				case 'url-link':
				case 'url-image': {
					this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [Validators.required]));
					this.urlForm.addControl('title', this.formBuilder.nonNullable.control('', [Validators.required]));

					break;
				}
        case 'url-youtube': {
          this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [Validators.required]));

          break;
        }
				default: {
					break;
				}
			}

			/** Apply selection */

			// prettier-ignore
			const markdownTextarea: MarkdownTextarea = this.getTextarea(this.textarea);

			if (!!markdownTextarea.selection) {
				Object.keys(this.urlForm.controls).forEach((key: string) => {
					const abstractControl: AbstractControl = this.urlForm.get(key);

					abstractControl.setValue(markdownTextarea.selection);
					abstractControl.markAsTouched();
				});
			}

			this.urlFormControl = markdownControl;
			this.urlFormModal = true;
		} else {
			this.getTextareaValue(markdownControl);
		}
	}

	getTextarea(textAreaElement: HTMLTextAreaElement): MarkdownTextarea {
		const { selectionStart, selectionEnd, value } = textAreaElement;

		const getPayload = (value: string): MarkdownTextareaPayloadSelection => {
			return {
				space: !!value.length && value === ' ',
				newline: !!value.length && value === '\n',
				character: !!value.length && value !== ' ' && value !== '\n'
			};
		};

		// prettier-ignore
		const selectionPayload: MarkdownTextareaPayload = {
			selectionBefore: getPayload(value.substring(0, selectionStart).slice(-1)),
			selectionAfter: getPayload(value.substring(selectionEnd, value.length).slice(0, 1))
		};

		return {
			selection: value.substring(selectionStart, selectionEnd).trim(),
			selectionStart,
			selectionEnd,
			selectionPayload,
			value
		};
	}

	// prettier-ignore
	getTextareaValue(markdownControl: MarkdownControl, urlForm?: FormGroup): void {
		const markdownTextarea: MarkdownTextarea = this.getTextarea(this.textarea);

    const selectionStart: number = markdownTextarea.selectionStart;
    const selectionEnd: number = markdownTextarea.selectionEnd;

    const before: string = markdownTextarea.value.substring(0, selectionStart);
    const after: string = markdownTextarea.value.substring(selectionEnd);

    const value: string = before + markdownControl.handler(markdownTextarea, urlForm?.value) + after;

		this.setTextareaValue(value);
	}

	setTextareaValue(value: string): void {
		const difference: number = value.length - this.textarea.value.length;

		const selectionStart: number = this.textarea.selectionStart + difference;
		const selectionEnd: number = this.textarea.selectionEnd + difference;

		this.textarea.value = value;
		this.textarea.dispatchEvent(new Event('input', { bubbles: true }));

		// prettier-ignore
		this.textarea.selectionStart = selectionStart !== selectionEnd ? selectionEnd : selectionStart;
		this.textarea.selectionEnd = selectionEnd;
		this.textarea.focus();
	}

	onSubmitUrlForm(): void {
		if (this.helperService.getFormValidation(this.urlForm)) {
			this.getTextareaValue(this.urlFormControl, this.urlForm);

			this.onCloseUrlForm();
		}
	}

	onCloseUrlForm(): void {
		// prettier-ignore
		Object.keys(this.urlForm.controls).forEach((key: string) => this.urlForm.removeControl(key));

		this.urlFormControl = undefined;
		this.urlFormModal = false;
	}
}
