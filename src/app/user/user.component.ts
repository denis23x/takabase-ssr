/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event as RouterEvent, Data } from '@angular/router';
import { combineLatest, EMPTY, of, Subscription } from 'rxjs';
import { User, Category, AuthService } from '../core';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  routeEvents$: Subscription;

  activatedRouteData$: Subscription;
  activatedRouteParams$: Subscription;

  user: User;
  userMe: boolean = false;

  category: Category;
  categoryList: Category[];
  categoryModal: 'create' | 'edit';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = combineLatest([
      this.authService.userSubject,
      this.activatedRoute.data.pipe(map((data: Data) => data.data))
    ]).subscribe({
      next: ([userAuthed, [user, categoryList]]: [User, [User, Category[]]]) => {
        this.userMe = userAuthed.id === user.id;
        this.user = user;

        this.categoryList = categoryList;
      },
      error: (error: any) => console.error(error),
      complete: () => console.debug('Auth service user/activated route data subscription complete')
    });

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(EMPTY),
        switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
        map((data: Data) => data.categoryId)
      )
      .subscribe({
        next: (categoryId: string) => {
          this.category = this.categoryList.find((category: Category) => {
            return category.id === Number(categoryId);
          });
        },
        error: (error: any) => console.error(error),
        complete: () => console.debug('Router events navigation end subscription complete')
      });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteParams$].forEach($ => $?.unsubscribe());
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
