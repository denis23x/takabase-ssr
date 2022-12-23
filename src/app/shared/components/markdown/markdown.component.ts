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
	PlatformService
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
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';

interface UrlForm {
	url: FormControl<string>;
}

/** https://www.markdownguide.org/basic-syntax/ */

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
	urlModal: boolean = false;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private markdownService: MarkdownService,
		private platformService: PlatformService,
		private formBuilder: FormBuilder,
		private helperService: HelperService
	) {
		this.urlForm = this.formBuilder.group<UrlForm>({
			url: this.formBuilder.control('', [
				this.helperService.getCustomValidator('url-image')
			])
		});
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

							// prettier-ignore
							this.history$.next(value ? this.history$.getValue().concat([value]) : []);
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
		this.history$.next(this.history$.getValue().slice(0, -1));

		this.setValue(String(this.history$.getValue().slice(-2).pop() || ''));
	}

	onControl(control: MarkdownControl): void {
		const { key } = control;

		if (key.includes('url')) {
			const { selection } = this.markdownService.getTextarea(this.textarea);

			// prettier-ignore
			this.urlForm.controls['url'].setValidators([this.helperService.getCustomValidator(key), Validators.required]);
			this.urlForm.get('url').setValue(selection);
			this.urlFormControl = control;
			this.urlModal = true;
		} else {
			this.setControl(control);
		}
	}

	setValue(value: string): void {
		const selectionStart: number = this.textarea.selectionStart;

		this.textarea.value = value;
		this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
		this.textarea.selectionEnd = selectionStart;
		this.textarea.focus();
	}

	setControl(control: MarkdownControl): void {
		// prettier-ignore
		const { selectionStart, selectionEnd, positionBefore, positionAfter, value } = this.markdownService.getTextarea(this.textarea);

		let start: number = selectionStart;
		let end: number = selectionEnd;

		if (start === end) {
			if (!positionBefore.space && !positionAfter.space) {
				start -= positionBefore.text.length;
				end += positionAfter.text.length;
			}
		}

		const valueHandler = (): string => {
			const url: string = this.urlForm.get('url').value;

			if (!!url.length) {
				this.urlFormControl = undefined;
				this.urlForm.reset();

				this.onCloseUrlForm();
			}

			switch (control.key) {
				case 'url-youtube':
				case 'url-gist':
					return control.handler(url);
				case 'url-link':
				case 'url-image':
					return control.handler(value.substring(start, end), url);
				default:
					return control.handler(value.substring(start, end));
			}
		};

		// prettier-ignore
		this.setValue(value.substring(0, start) + valueHandler() + value.substring(end));
	}

	onSubmitUrlForm(): void {
		if (this.helperService.getFormValidation(this.urlForm)) {
			this.setControl(this.urlFormControl);
		}
	}

	onCloseUrlForm(): void {
		this.urlModal = false;
		this.urlForm.controls['url'].clearValidators();
		this.urlForm.reset();
	}
}
