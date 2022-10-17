/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { PlatformService, HelperService, Post } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import Split from 'split-grid';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  activatedRouteData$: Subscription;

  mouseup$: Subscription;
  mousedown$: Subscription;
  mousemove$: Subscription;

  postForm: UntypedFormGroup;
  postForm$: Subscription;

  editorMinSize = 425;
  editorWhitespace: boolean = false;
  editorScrollSync: boolean = false;

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    private formBuilder: UntypedFormBuilder,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService
  ) {
    this.postForm = this.formBuilder.group({
      body: ['', [Validators.required, Validators.minLength(24), Validators.maxLength(7200)]]
    });
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(
        pluck('data'),
        filter((post: Post) => !!post)
      )
      .subscribe({
        next: (post: Post) => this.postForm.get('body').setValue(post.body),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Activated route data subscription complete')
      });
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      /** Initialize Split */

      Split({
        minSize: this.editorMinSize,
        columnGutters: [
          {
            track: 1,
            element: this.gutter.nativeElement
          }
        ]
      });

      /** Initialize Drag HTML */

      this.onDrag();
    }
  }

  ngOnDestroy(): void {
    [
      this.activatedRouteData$,
      this.mouseup$,
      this.mousedown$,
      this.mousemove$,
      this.postForm$
    ].forEach($ => $?.unsubscribe());
  }

  onDrag(): void {
    /** https://htmldom.dev/drag-to-scroll/ */

    const htmlElement: HTMLElement = this.document.querySelector('html');
    const position: any = {
      top: 0,
      left: 0,
      x: 0,
      y: 0
    };

    const mouseDownHandler = (mouseEvent: MouseEvent): void => {
      htmlElement.style.cursor = 'row-resize';
      htmlElement.style.userSelect = 'none';

      position.left = htmlElement.scrollLeft;
      position.top = htmlElement.scrollTop;
      position.x = mouseEvent.clientX;
      position.y = mouseEvent.clientY;

      this.mousemove$ = fromEvent(this.document, 'mousemove').subscribe({
        next: (event: Event) => mouseMoveHandler(event as MouseEvent),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Document mouse move subscription complete')
      });

      this.mouseup$ = fromEvent(this.document, 'mouseup').subscribe({
        next: () => mouseUpHandler(),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Document mouse up subscription complete')
      });
    };

    const mouseMoveHandler = (mouseEvent: MouseEvent): void => {
      const dx: number = mouseEvent.clientX - position.x;
      const dy: number = mouseEvent.clientY - position.y;

      htmlElement.scrollTop = position.top - dy;
      htmlElement.scrollLeft = position.left - dx;
    };

    const mouseUpHandler = (): void => {
      htmlElement.removeAttribute('style');

      this.mousemove$?.unsubscribe();
      this.mouseup$?.unsubscribe();
    };

    this.mousedown$ = fromEvent(this.document, 'mousedown')
      // @ts-ignore
      .pipe(filter((event: Event) => event.target.parentElement.id === 'grip-horizontal'))
      .subscribe({
        next: (event: Event) => mouseDownHandler(event as MouseEvent),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Document mouse down subscription complete')
      });
  }

  onSubmitPostForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.router
        .navigate(['./submit'], {
          relativeTo: this.activatedRoute,
          state: {
            postForm: this.postForm.value
          }
        })
        .then(() => console.debug('Route changed'));
    }
  }
}
