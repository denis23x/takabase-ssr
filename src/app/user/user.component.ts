/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  Event as RouterEvent,
  Data,
  Params
} from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, Category, AuthService, TitleService } from '../core';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription | undefined;
  routeEvents$: Subscription | undefined;

  user: User | undefined;

  authUser: User | undefined;
  authUser$: Subscription | undefined;

  category: Category | undefined;
  categoryList: Category[] = [];
  categoryModal: 'create' | 'edit' | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private titleService: TitleService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(map((data: Data) => data.data))
      .subscribe({
        next: ([user, categoryList]: [User, Category[]]) => {
          this.user = user;

          this.categoryList = categoryList;

          this.titleService.setTitle(this.user.name);
        },
        error: (error: any) => console.error(error)
      });

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(EMPTY),
        switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
        map((params: Params) => params.categoryId)
      )
      .subscribe({
        next: (categoryId: string | undefined) => {
          // prettier-ignore
          const category: Category | undefined = this.categoryList.find((category: Category) => {
            return category.id === Number(categoryId);
          });

          if (!!category) {
            if (!!this.category) {
              this.titleService.updateTitle(this.category.name, category.name);
            } else {
              this.titleService.appendTitle(category.name);
            }
          } else {
            this.titleService.setTitle(this.user.name);
          }

          this.category = category;
        },
        error: (error: any) => console.error(error)
      });

    this.authUser$ = this.authService.user.subscribe({
      next: (user: User) => (this.authUser = user),
      error: (error: any) => console.error(error)
    });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.routeEvents$, this.authUser$].forEach($ => $?.unsubscribe());
  }

  onSubmitCategoryForm(category: Category): void {
    let path: string[] = ['/@' + this.user.name];

    // prettier-ignore
    this.categoryList = this.categoryList.filter((category: Category) => category.id !== this.category?.id);

    if (!!category.id) {
      path = path.concat(['category', String(category.id)]);

      this.categoryList.unshift(category);
    }

    this.router.navigate(path).then(() => {
      this.category = !!category.id ? category : undefined;
      this.categoryModal = undefined;
    });
  }
}
