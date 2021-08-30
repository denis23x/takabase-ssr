/** @format */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MarkdownControlList, MarkdownControl, MarkdownService } from '../../../core';
import { HelperService, PlatformService } from '../../../../core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-markdown, [appMarkdown]',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  set appTextareaId(markdownId: string) {
    this.textareaId = markdownId;
  }

  @Input()
  set appPreviewId(previewId: string) {
    this.previewId = previewId;
  }

  @Output() update = new EventEmitter<string>();

  controlList: MarkdownControl[] = MarkdownControlList();

  textareaInput$: Subscription;
  textareaId: string;
  textarea: HTMLTextAreaElement;

  previewId: string;
  preview: HTMLElement;

  historyRemember = true;
  history$ = new BehaviorSubject<string[]>([]);

  urlForm: FormGroup;
  urlFormControl = {} as MarkdownControl;
  urlFormIsSubmitting: boolean;
  urlModal: boolean;

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    private markdownService: MarkdownService,
    private platformService: PlatformService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.urlForm = this.fb.group({
      url: ['']
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      // @ts-ignore
      this.textarea = this.document.querySelector('#' + this.textareaId);
      // @ts-ignore
      this.preview = this.document.querySelector('#' + this.previewId);

      this.textareaInput$ = fromEvent(this.textarea, 'input')
        .pipe(startWith(1), debounceTime(200))
        .subscribe(() => {
          this.markdownService.getRender(this.textarea.value, this.preview);

          if (this.historyRemember) {
            const value = this.textarea.value;

            this.history$.next(value ? this.history$.getValue().concat([value]) : []);
          } else {
            this.historyRemember = true;
          }
        });
    }
  }

  ngOnDestroy(): void {
    [this.textareaInput$, this.history$].forEach($ => $?.unsubscribe());
  }

  setValue(value: string): void {
    const selectionStart = this.textarea.selectionStart;

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

      this.urlForm.get('url')?.setValue(selection);
      this.urlFormControl = control;
      this.urlModal = true;
    } else {
      this.setControl(control);
    }
  }

  setControl(control: MarkdownControl): void {
    const { selectionStart, selectionEnd, positionBefore, positionAfter, value } =
      this.markdownService.getTextarea(this.textarea);

    let start: number = selectionStart;
    let end: number = selectionEnd;

    if (start === end) {
      if (!positionBefore.space && !positionAfter.space) {
        start -= positionBefore.text.length;
        end += positionAfter.text.length;
      }
    }

    const valueHandler = () => {
      const url = this.urlForm.get('url')?.value;

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

  onSubmitUrlForm(): void {
    if (this.helperService.getFormValidation(this.urlForm)) {
      this.setControl(this.urlFormControl);
    }
  }

  onCloseUrlForm(): void {
    this.urlModal = false;
    this.urlForm.controls['url'].clearValidators();
    this.urlForm.reset();

    this.textarea.focus();
  }
}
