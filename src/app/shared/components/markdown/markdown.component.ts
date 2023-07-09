/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnDestroy,
	OnInit,
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
import { BehaviorSubject, EMPTY, fromEvent, merge, Subscription } from 'rxjs';
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
	MarkdownWrapper,
	MarkdownWrapperPayload
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

	// prettier-ignore
	@ViewChild('controlListTableElement') controlListTableElement: ElementRef | undefined;

	@ViewChild('dropdownHeading') dropdownHeading: DropdownComponent | undefined;
	// prettier-ignore
	@ViewChild('dropdownFormatting') dropdownFormatting: DropdownComponent | undefined;
	@ViewChild('dropdownList') dropdownList: DropdownComponent | undefined;

	// prettier-ignore
	@ViewChild('dropdownEmojiMart') dropdownEmojiMart: DropdownComponent | undefined;

	@ViewChild('dropdownTable') dropdownTable: DropdownComponent | undefined;

	@Output() modalToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	set appScrollSync(scrollSync: boolean) {
		this.scrollSync = scrollSync;

		if (this.platformService.isBrowser()) {
			if (!!this.textarea) {
				this.textarea.dispatchEvent(new Event('scroll'));
			}
		}
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
	controlListTable: MarkdownControl = MarkdownControlTable();
	controlListSpoiler: MarkdownControl = MarkdownControlSpoiler();
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
	urlForm$: Subscription | undefined;
	urlFormControl: MarkdownControl | undefined;
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
						this.markdownService.setRender(this.textarea.value, this.preview);

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
			this.controlListScroll$,
			this.urlForm$
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
				data: async () => fetch('/assets/emoji/github_emojis.json').then((response: Response) => response.json()),
				onEmojiSelect: (event: any) => {
					const markdownControl: MarkdownControl = {
						...this.controlListEmojiMart,
						handler: () => event.shortcodes
					};

					this.setTextareaValue(this.getTextareaValue(markdownControl));
				},
				maxFrequentRows: 3,
				set: 'native'
			});

			this.document
				.getElementById('emojiMartPicker')
				.appendChild(emojiMartPicker);
		}
	}

	// prettier-ignore
	onTableMouseEnter(mouseEvent: MouseEvent): void {
    const parentElement: any = (mouseEvent.target as HTMLElement).parentElement.getBoundingClientRect();
    const targetElement: any = (mouseEvent.target as HTMLElement).getBoundingClientRect();

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

		// prettier-ignore
		const dropdownComponent = (): DropdownComponent | undefined => {
      return dropdownComponentList.find((dropdownComponent: DropdownComponent) => {
        return dropdownComponent.dropdownState;
      })
    };

		const controlListElement: any = this.controlListElement.nativeElement;

		this.controlListScroll$ = fromEvent(controlListElement, 'scroll')
			.pipe(filter(() => !!dropdownComponent()))
			.subscribe({
				next: () => dropdownComponent().setStateStyle(false),
				error: (error: any) => console.error(error)
			});
	}

	setScrollSyncHandler(): void {
		// prettier-ignore
		const getScrollTop = (a: HTMLElement, b: HTMLElement): number => {
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

	setBack(): void {
		const history: string[] = this.textareaHistory$.getValue().slice(0, -1);
		const historyValue: string = history[history.length - 1];

		this.textareaHistory$.next(history);
		this.textareaHistoryToggle = false;

		this.setTextareaValue(historyValue);
	}

	getMarkdownTextarea(textAreaElement: HTMLTextAreaElement): MarkdownTextarea {
		const { selectionStart, selectionEnd, value } = textAreaElement;

		// prettier-ignore
		const getWrapperPayload = (value: string): MarkdownWrapperPayload => {
			return {
				space: !!value.length && value === ' ',
				newline: !!value.length && value === '\n',
				character: !!value.length && value !== ' ' && value !== '\n'
			};
		};

		// prettier-ignore
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

	// prettier-ignore
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
		this.textarea.selectionStart = selectionStart !== selectionEnd ? selectionEnd : selectionStart;
		this.textarea.selectionEnd = selectionEnd;
		this.textarea.focus();
	}

	onToggleUrlForm(toggle: boolean, markdownControl?: MarkdownControl): void {
		if (toggle) {
			/** Build dynamic form */

			// prettier-ignore
			switch (markdownControl.key) {
        case 'url-link': {
          this.urlForm.addControl('title', this.formBuilder.nonNullable.control('', [Validators.required]));
          this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(this.helperService.getRegex('url'))]));

          const abstractControlTitle: AbstractControl = this.urlForm.get('title');
          const abstractControlUrl: AbstractControl = this.urlForm.get('url');

          this.urlForm$?.unsubscribe();
          this.urlForm$ = abstractControlUrl.valueChanges
            .pipe(filter(() => abstractControlTitle.untouched))
            .subscribe((value: string) => abstractControlTitle.setValue(value));

          break;
        }
        case 'url-image': {
          this.urlForm.addControl('title', this.formBuilder.nonNullable.control('', []));
          this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(this.helperService.getRegex('url'))]));

          break;
        }
        case 'url-youtube': {
          this.urlForm.addControl('url', this.formBuilder.nonNullable.control('', [Validators.required, Validators.pattern(this.helperService.getRegex('youtube'))]));

          break;
        }
        default: {
          break;
        }
      }

			/** Apply selection */

			// prettier-ignore
			const markdownTextarea: MarkdownTextarea = this.getMarkdownTextarea(this.textarea);

			if (!!markdownTextarea.selection) {
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
			this.urlFormModal = true;
		} else {
			// prettier-ignore
			Object.keys(this.urlForm.controls).forEach((key: string) => this.urlForm.removeControl(key));

			this.urlForm$?.unsubscribe();
			this.urlFormControl = undefined;
			this.urlFormModal = false;
		}

		this.modalToggle.emit(toggle);
	}

	onSubmitUrlForm(): void {
		if (this.helperService.getFormValidation(this.urlForm)) {
			/** Set value */

			this.urlForm.disable();

			// prettier-ignore
			this.setTextareaValue(this.getTextareaValue(this.urlFormControl, this.urlForm.value));

			/** Clear urlForm && emit modalToggle  */

			this.urlForm.enable();

			this.onToggleUrlForm(false);
		}
	}
}
