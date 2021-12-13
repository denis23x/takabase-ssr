/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  Event as RouterEvent,
  Navigation,
  NavigationEnd,
  Router
} from '@angular/router';
import { filter, startWith, switchMap } from 'rxjs/operators';
import {
  Category,
  CategoryState,
  HelperService,
  PlatformService,
  Post,
  PostHandler
} from '../../core';
import { EMPTY, of, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Split from 'split-grid';

@Component({
  selector: 'app-post-handler',
  templateUrl: './handler.component.html'
})
export class PostHandlerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  @Output() submitted = new EventEmitter<PostHandler>();

  @Input()
  set appPost(post: Post) {
    this.post = post;

    this.postForm.patchValue({
      body: this.post.body,
      title: this.post.title,
      categoryId: this.post.category.id,
      categoryName: this.post.category.name
    });
  }

  @Input()
  set appCategoryList(categoryList: Category[]) {
    this.categoryList = categoryList;
  }

  routeEvents$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;
  postModal: boolean;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  post: Post;
  categoryList: Category[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService
  ) {
    this.postForm = this.formBuilder.group({
      body: [
        'Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века.',
        [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]
      ],
      title: ['Lorem', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      categoryId: [null, [Validators.required]],
      categoryName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(this.activatedRoute),
        switchMap(() => {
          const navigation: Navigation = this.router.getCurrentNavigation();

          if (navigation && navigation.extras.state) {
            return of(navigation.extras.state as CategoryState);
          }

          return EMPTY;
        })
      )
      .subscribe((categoryState: CategoryState) => {
        const { message, category } = categoryState;
        const { id, name } = category;

        const messageMap = {
          ['categoryCreated']: (): void => {
            this.categoryList.unshift(category);

            this.postForm.patchValue({
              categoryId: id,
              categoryName: name
            });
          }
        };

        messageMap[message]();
      });

    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.pipe(filter(() => this.postForm.get('categoryId').valid))
      .subscribe((categoryId: number) => {
        const category: Category = this.categoryList.find((category: Category) => {
          return category.id === categoryId;
        });

        this.postForm.get('categoryName').setValue(category.name);
      });
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
    [this.routeEvents$, this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      this.submitted.emit({
        postForm: this.postForm.value,
        onError: () => (this.postFormIsSubmitted = false)
      });
    }
  }
}
