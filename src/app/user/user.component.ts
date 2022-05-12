/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { combineLatest, EMPTY, of, Subscription } from 'rxjs';
import { User, Category, AuthService } from '../core';
import { filter, pluck, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  routeEvents$: Subscription;

  activatedRouteData$: Subscription;
  activatedRouteParams$: Subscription;

  user: User;
  userMe: boolean;

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
      this.activatedRoute.data.pipe(pluck('data'))
    ]).subscribe(([userAuthed, [user, categoryList]]: [User, [User, Category[]]]) => {
      this.userMe = userAuthed.id === user.id;
      this.user = user;

      this.categoryList = categoryList;
    });

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(EMPTY),
        switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
        pluck('categoryId')
      )
      .subscribe((categoryId: string) => {
        this.category = this.categoryList.find((category: Category) => {
          return category.id === Number(categoryId);
        });
      });

    // this.activatedRouteParams$ = this.activatedRoute.firstChild.params
    //   .pipe(pluck('categoryId'))
    //   .subscribe((categoryId: string) => {
    //     this.category = this.categoryList.find((category: Category) => {
    //       return category.id === Number(categoryId);
    //     });
    //   });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteParams$].forEach($ => $?.unsubscribe());
  }

  onSubmitCategoryForm(category: Category): void {
    this.authService.getAuthorization();

    let path: string[] = ['/@' + this.user.name];

    category = !!category.id ? category : undefined;
    category && (path = path.concat(['category', String(category.id)]));

    this.router.navigate(path).then(() => {
      this.category = category;
      this.categoryModal = undefined;
    });
  }
}
