/** @format */

import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MarkdownControl, MarkdownService, HelperService, PlatformService } from '../../../core';
import { MarkdownControlList } from './markdown-control-list';
import { BehaviorSubject, fromEvent, merge, Subscription, of, EMPTY } from 'rxjs';
import { debounceTime, filter, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-markdown, [appMarkdown]',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
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

  controlList: MarkdownControl[] = MarkdownControlList();

  scrollSync: boolean;
  scrollSync$: Subscription;
  scrollSyncIsBusy: boolean;

  textareaInput$: Subscription;
  textareaId: string;
  textarea: HTMLTextAreaElement;

  previewId: string;
  preview: HTMLElement;

  historyRemember = true;
  history$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  urlForm: FormGroup;
  urlFormControl = {} as MarkdownControl;
  urlFormIsSubmitted: boolean;
  urlModal: boolean;

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    private markdownService: MarkdownService,
    private platformService: PlatformService,
    private formBuilder: FormBuilder,
    private helperService: HelperService
  ) {
    this.urlForm = this.formBuilder.group({
      url: ['']
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
        .subscribe(() => {
          this.markdownService.getRender(this.textarea.value, this.preview);

          if (this.historyRemember) {
            const value = this.textarea.value;

            this.history$.next(value ? this.history$.getValue().concat([value]) : []);
          } else {
            this.historyRemember = true;
          }
        });

      this.scrollSync$ = merge(
        fromEvent(this.textarea, 'scroll'),
        fromEvent(this.preview, 'scroll')
      )
        .pipe(
          filter(() => this.scrollSync),
          debounceTime(10),
          switchMap((event: Event) => {
            const { id } = event.target as Element;
            const elementList = ['textarea', 'preview'];

            return of([
              this[elementList[+(id === 'preview')]],
              this[elementList[+(id === 'textarea')]]
            ]);
          })
        )
        .subscribe(([element, target]: HTMLTextAreaElement[] | HTMLElement[]) => {
          if (!this.scrollSyncIsBusy) {
            target.scrollTop = this.getScroll(element, target);
          }

          this.scrollSyncIsBusy = !this.scrollSyncIsBusy;
        });
    }
  }

  ngOnDestroy(): void {
    [this.textareaInput$, this.history$, this.scrollSync$].forEach($ => $?.unsubscribe());
  }

  setValue(value: string): void {
    const selectionStart: number = this.textarea.selectionStart;

    this.textarea.value = value;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    this.textarea.selectionEnd = selectionStart;
    this.textarea.focus();
  }

  onControl(control: MarkdownControl): void {
    const { key } = control;

    if (key.includes('url')) {
      const { selection } = this.markdownService.getTextarea(this.textarea);

      this.urlForm.controls['url'].setValidators([
        this.helperService.getCustomValidator(key),
        Validators.required
      ]);

      this.urlForm.get('url').setValue(selection);
      this.urlFormControl = control;
      this.urlModal = true;
    } else {
      this.setControl(control);
    }
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
      const url = this.urlForm.get('url').value;

      if (url) {
        this.urlFormControl = {} as MarkdownControl;
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

    this.setValue(value.substring(0, start) + valueHandler() + value.substring(end));
  }

  onBack(): void {
    this.historyRemember = false;
    this.history$.next(this.history$.getValue().slice(0, -1));

    this.setValue(String(this.history$.getValue().slice(-2).pop() || ''));
  }

  getScroll(a: HTMLTextAreaElement | HTMLElement, b: HTMLTextAreaElement | HTMLElement): number {
    const aScrollTop = a.scrollTop;
    const aMaxHeight = a.scrollHeight - a.clientHeight;
    const aScrollPosition = Math.round((aScrollTop / aMaxHeight) * 100);

    const bMaxHeight = b.scrollHeight - b.clientHeight;
    const bScrollPosition = Math.round(bMaxHeight * (aScrollPosition / 100));

    return bScrollPosition;
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
