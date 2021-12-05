/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Navigation, NavigationEnd, Params, Router } from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, UserProfile, Category, CategoryState } from '../core';
import { debounceTime, filter, pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeParams$: Subscription;

  user: User;

  categoryList: Category[] = [];
  categoryModal: string;
  categoryActive: Category;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;
      });

    this.routeParams$ = this.router.events
      .pipe(
        debounceTime(200),
        switchMap(() => {
          const activatedRoute = this.activatedRoute.snapshot.children.find((child: any) => {
            return child.paramMap.get('categoryId');
          });

          return of(activatedRoute);
        })
      )
      .subscribe((activatedRoute: any) => {
        if (activatedRoute) {
          this.categoryActive = this.categoryList.find((category: Category) => {
            return category.id === Number(activatedRoute.paramMap.get('categoryId'));
          });
        } else {
          this.categoryActive = undefined;
        }
      });
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(action: string, category?: Category | void): void {
    this.categoryModal = undefined;

    if (category) {
      switch (action) {
        case 'create': {
          this.categoryList.unshift(category);

          this.router
            .navigate(['/profile/category', category.id])
            .then(() => console.log('Route changed'));

          break;
        }
        case 'edit': {
          const i = this.categoryList.findIndex((c: Category) => c.id === category.id);

          this.categoryList[i] = category;

          break;
        }
        case 'delete': {
          this.categoryList = this.categoryList.filter((c: Category) => c.id !== category.id);

          this.router.navigate(['/profile']).then(() => console.log('Route changed'));

          break;
        }
      }
    }
  }
}
