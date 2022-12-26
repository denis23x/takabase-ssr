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
	MarkdownControl,
	MarkdownService,
	HelperService,
	PlatformService,
	MarkdownTextarea
} from '../../../core';
import {
	MarkdownControlHeading,
	MarkdownControlFormatting,
	MarkdownControlList,
	MarkdownControlUrl
} from './markdown-controls';
import {
	BehaviorSubject,
	fromEvent,
	merge,
	Subscription,
	of,
	EMPTY
} from 'rxjs';
import { debounceTime, filter, startWith, switchMap } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';

interface UrlForm {
	title?: FormControl<string>;
	url?: FormControl<string>;
}

/** https://www.markdownguide.org/basic-syntax/ */
/** https://markdown-it.github.io/ */

@Component({
	selector: 'app-markdown, [appMarkdown]',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('controlListElement') controlListElement: ElementRef | undefined;

	@ViewChild('dropdownHeading') dropdownHeading: DropdownComponent | undefined;
	// prettier-ignore
	@ViewChild('dropdownFormatting') dropdownFormatting: DropdownComponent | undefined;
	@ViewChild('dropdownList') dropdownList: DropdownComponent | undefined;

	@Input()
	set appScrollSync(scrollSync: boolean) {
		this.scrollSync = scrollSync;
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
	controlListScroll$: Subscription | undefined;

	scrollSync: boolean = false;
	scrollSync$: Subscription | undefined;
	scrollSyncIsBusy: boolean = false;

	textareaInput$: Subscription | undefined;
	textareaId: string | undefined;
	textarea: HTMLTextAreaElement | undefined;

	previewId: string | undefined;
	preview: HTMLElement | undefined;

	historyRemember: boolean = true;
	history$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

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
				.pipe(startWith(EMPTY), debounceTime(200))
				.subscribe({
					next: () => {
						this.markdownService.getRender(this.textarea.value, this.preview);

						if (this.historyRemember) {
							const value: string = this.textarea.value;
							const history: string[] = this.history$.getValue();

							this.history$.next(value ? history.concat([value]) : []);
						} else {
							this.historyRemember = true;
						}
					},
					error: (error: any) => console.error(error)
				});
		}

		this.setDropdownHandler();

		this.setScrollSyncHandler();
	}

	ngOnDestroy(): void {
		[
			this.textareaInput$,
			this.history$,
			this.scrollSync$,
			this.controlListScroll$
		].forEach($ => $?.unsubscribe());
	}

	setDropdownHandler(): void {
		const dropdownComponentList: DropdownComponent[] = [
			this.dropdownHeading,
			this.dropdownFormatting,
			this.dropdownList
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
		// prettier-ignore
		const getScroll = (a: HTMLTextAreaElement | HTMLElement, b: HTMLTextAreaElement | HTMLElement): number => {
      const aScrollTop: number = a.scrollTop;
      const aMaxHeight: number = a.scrollHeight - a.clientHeight;
      const aScrollPosition: number = Math.round((aScrollTop / aMaxHeight) * 100);

      const bMaxHeight: number = b.scrollHeight - b.clientHeight;
      const bScrollPosition: number = Math.round(bMaxHeight * (aScrollPosition / 100));

      return Number(bScrollPosition);
    }

		this.scrollSync$ = merge(
			fromEvent(this.textarea, 'scroll'),
			fromEvent(this.preview, 'scroll')
		)
			.pipe(
				filter(() => this.scrollSync),
				debounceTime(10),
				switchMap((event: Event) => {
					const { id } = event.target as Element;
					const elementList: string[] = ['textarea', 'preview'];

					return of([
						this[elementList[+(id === 'preview')]],
						this[elementList[+(id === 'textarea')]]
					]);
				})
			)
			.subscribe({
				next: ([element, target]: HTMLTextAreaElement[] | HTMLElement[]) => {
					if (!this.scrollSyncIsBusy) {
						target.scrollTop = getScroll(element, target);
					}

					this.scrollSyncIsBusy = !this.scrollSyncIsBusy;
				},
				error: (error: any) => console.error(error)
			});
	}

	onBack(): void {
		this.historyRemember = false;

		const history: string[] = this.history$.getValue();

		history.pop();

		const value: string = history[history.length - 1];

		if (!!value) {
			this.setTextareaValue(value);
		}
	}

	onMarkdownControl(markdownControl: MarkdownControl): void {
		const markdownTextarea: MarkdownTextarea = this.getTextarea(this.textarea);

		if (markdownControl.key.includes('url')) {
			// prettier-ignore
			this.urlForm.addControl('url', this.formBuilder.control('', [Validators.required, this.helperService.getCustomValidator(markdownControl.key)]));

			if (['url-link', 'url-image'].includes(markdownControl.key)) {
				// prettier-ignore
				this.urlForm.addControl('title', this.formBuilder.control('', [Validators.required]));
			}

			const regex: RegExp = this.helperService.getRegex(markdownControl.key);
			const regexValid: boolean = regex.test(markdownTextarea.selection || '');

			Object.keys(this.urlForm.controls).forEach((key: string) => {
				const abstractControl: AbstractControl = this.urlForm.get(key);

				if (key === 'title' || (key === 'url' && regexValid)) {
					abstractControl.setValue(markdownTextarea.selection);
				}

				if (!!abstractControl.value) {
					abstractControl.markAsTouched();
				}
			});

			this.urlFormControl = markdownControl;
			this.urlFormModal = true;
		} else {
			this.getTextareaValue(markdownControl);
		}
	}

	getTextarea(textAreaElement: HTMLTextAreaElement): MarkdownTextarea {
		const { selectionStart, selectionEnd, value } = textAreaElement;

		return {
			selection: value.substring(selectionStart, selectionEnd).trim(),
			selectionStart,
			selectionEnd,
			value
		};
	}

	// prettier-ignore
	getTextareaValue(markdownControl: MarkdownControl, urlForm?: FormGroup): void {
		const markdownTextarea: MarkdownTextarea = this.getTextarea(this.textarea);

		const getControlHandler = (markdownControl: MarkdownControl): string => {
			// prettier-ignore
			const placeholder: string = markdownControl.key.split('-').pop().toUpperCase();

			switch (markdownControl.key) {
				case 'heading-h1':
				case 'heading-h2':
				case 'heading-h3':
				case 'heading-h4':
					if (!!markdownTextarea.selection) {
						// prettier-ignore
						const value: string = markdownControl.handler(markdownTextarea.selection);

						return '\n\n' + value + '\n\n';
					}

					return markdownControl.handler(placeholder);
				case 'list-unordered':
				case 'list-ordered':
          if (!!markdownTextarea.selection) {
            // prettier-ignore
            const value: string = markdownControl.handler(markdownTextarea.selection);

            return '\n\n' + value + '\n\n';
          }

          return markdownControl.handler(placeholder);
        case 'formatting-bold':
				case 'formatting-strikethrough':
				case 'formatting-italic':
					// prettier-ignore
					return markdownControl.handler(markdownTextarea.selection || placeholder);
				case 'url-youtube':
				case 'url-gist':
				case 'url-link':
				case 'url-image':
					return markdownControl.handler(urlForm.value);
				default:
					return '';
			}
		};

		const getValue = (): string => {
			const selectionStart: number = markdownTextarea.selectionStart;
			const selectionEnd: number = markdownTextarea.selectionEnd;

			const left: string = markdownTextarea.value.substring(0, selectionStart);
			const right: string = markdownTextarea.value.substring(selectionEnd);

			return left + getControlHandler(markdownControl) + right;
		};

		this.setTextareaValue(getValue());
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
