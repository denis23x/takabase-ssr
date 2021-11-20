/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Navigation, NavigationEnd, Router } from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, UserProfile, Category, CategoryState } from '../core';
import { filter, pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeState$: Subscription;

  user: User;
  categoryList: Category[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;
      });

    this.routeState$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => {
          const navigation: Navigation = this.router.getCurrentNavigation();

          return !!Object.keys(navigation.extras.state || {}).length
            ? of(navigation.extras.state)
            : EMPTY;
        }),
        filter((state: any) => state.category),
        switchMap((categoryState: CategoryState) => {
          let categoryList: Category[] = this.categoryList;

          switch (categoryState.action) {
            case 'create':
              categoryList = categoryList.concat([categoryState.category as Category]).sort();

              return of(categoryList);
            case 'update':
              const i = categoryList.findIndex((category: Category) => {
                return category.id === categoryState.category.id;
              });

              categoryList[i] = categoryState.category;

              return of(categoryList);
            case 'delete':
              categoryList = categoryList.filter((category: Category) => {
                return category.id !== categoryState.category.id;
              });

              return of(categoryList);
            default:
              return of(categoryList);
          }
        })
      )
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeState$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
