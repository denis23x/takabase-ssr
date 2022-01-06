/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Event as RouterEvent,
  Navigation,
  NavigationEnd,
  Router
} from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, Category, CategoryState, AuthService } from '../core';
import { filter, pluck, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeEvents$: Subscription;

  user: User;
  userIsProfile: boolean;

  userAuthed$: Subscription;
  userAuthed: User;

  categoryList: Category[] = [];
  categoryActive: Category;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userAuthed$ = this.authService.user.subscribe((user: User) => (this.userAuthed = user));

    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe(([user, categoryList]: [User, Category[]]) => {
        this.user = user;
        this.userIsProfile = this.userAuthed.id === this.user.id;

        this.categoryList = categoryList;
      });

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(this.activatedRoute),
        tap(() => {
          const categoryId = this.activatedRoute.snapshot.children
            .map((activatedRouteSnapshot: ActivatedRouteSnapshot) => {
              return activatedRouteSnapshot.paramMap.get('categoryId');
            })
            .shift();

          this.categoryActive = this.categoryList.find((category: Category) => {
            return category.id === Number(categoryId);
          });
        }),
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
        const { id } = category;

        const i = this.categoryList.findIndex((category: Category) => category.id === id);

        const messageMap = {
          ['categoryCreated']: (): void => {
            this.router.navigate(['/profile/category', id]).then(() => {
              this.categoryList.unshift(category);
              this.categoryActive = category;
            });
          },
          ['categoryUpdated']: (): void => {
            this.categoryList[i] = category;
            this.categoryActive = category;
          },
          ['categoryDeleted']: (): void => {
            this.router.navigate(['/profile']).then(() => {
              this.categoryList.splice(i, 1);
              this.categoryActive = undefined;
            });
          }
        };

        messageMap[message]();
      });
  }

  ngOnDestroy(): void {
    [this.routeData$, this.userAuthed$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
