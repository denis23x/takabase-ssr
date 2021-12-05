/** @format */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { pluck } from 'rxjs/operators';
import { Category, PlatformService, Post } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Split from 'split-grid';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  routeData$: Subscription;

  postForm: FormGroup;
  postModal: boolean;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  categoryList: Category[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.formBuilder.group({
      body: [
        'Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века.',
        [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]
      ]
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
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
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(post?: Post | void): void {
    this.postModal = false;

    if (post) {
      this.router
        .navigate(['/profile/category', post.category.id, 'posts', post.id])
        .then(() => console.log('Route changed'));
    }
  }
}
