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
  routeData$: Subscription;
  routeEvents$: Subscription;

  user: User;
  userMe: boolean;

  category: Category;
  categoryModal: 'create' | 'edit';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeData$ = combineLatest([
      this.authService.userSubject,
      this.activatedRoute.data.pipe(pluck('data'))
    ]).subscribe(([authedUser, routedUser]: [User, User]) => {
      this.userMe = authedUser.id === routedUser.id;
      this.user = this.userMe ? authedUser : routedUser;
    });

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(EMPTY),
        switchMap(() => of(this.activatedRoute.snapshot.firstChild.params)),
        pluck('categoryId')
      )
      .subscribe((categoryId: string) => {
        this.category = this.user.categories.find((category: Category) => {
          return category.id === Number(categoryId);
        });
      });
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeEvents$].filter($ => $).forEach($ => $.unsubscribe());
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
