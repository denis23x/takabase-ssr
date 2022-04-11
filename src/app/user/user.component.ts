/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { User, Category, AuthService } from '../core';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;
  activatedRouteParams$: Subscription;

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
    this.activatedRouteData$ = combineLatest([
      this.authService.userSubject,
      this.activatedRoute.data.pipe(pluck('data'))
    ]).subscribe(([userAuthed, userResolved]: [User, User]) => {
      this.userMe = userAuthed.id === userResolved.id;
      this.user = userResolved;
    });

    this.activatedRouteParams$ = this.activatedRoute.firstChild.params
      .pipe(pluck('categoryId'))
      .subscribe((categoryId: string) => {
        this.category = this.user.categories.find((category: Category) => {
          return category.id === Number(categoryId);
        });
      });
  }

  ngOnDestroy(): void {
    // prettier-ignore
    [this.activatedRouteData$, this.activatedRouteParams$].filter($ => $).forEach($ => $.unsubscribe());
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
