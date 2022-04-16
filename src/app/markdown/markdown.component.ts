/** @format */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlatformService, HelperService, Post } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Split from 'split-grid';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  activatedRouteData$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  constructor(
    private formBuilder: FormBuilder,
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
      .subscribe((post: Post) => this.postForm.get('body').setValue(post.body));
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      Split({
        minSize: this.editorMinSize,
        columnGutters: [
          {
            track: 1,
            element: this.gutter.nativeElement
          }
        ]
      });
    }
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.postForm$].forEach($ => $?.unsubscribe());
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
