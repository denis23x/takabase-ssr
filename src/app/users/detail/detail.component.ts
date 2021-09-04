/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User, Category, Post, PostService, UserProfile } from '../../core';
import { pluck, tap } from 'rxjs/operators';

@Component({
  selector: 'app-users-detail',
  templateUrl: './detail.component.html'
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  categoriesSwitch$ = new BehaviorSubject<Category>({} as Category);

  user: User;
  categoryList: Category[] = [];
  postList: Post[] = [];

  isProfile: boolean;

  constructor(private route: ActivatedRoute, private postService: PostService) {}

  ngOnInit() {
    this.routeData$ = this.route.data
      .pipe(
        tap(({ isProfile }) => (this.isProfile = isProfile)),
        pluck('data')
      )
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;
        this.postList = userProfile.postList;
      });

    // this.categoriesSwitch$
    //   .pipe(
    //     tap(category => {
    //       // this.posts$.next([]);
    //     }),
    //     switchMap(({ id: categoryId }) => {
    //       const { id: userId } = this.user$.getValue();
    //       return this.postService.getAll({
    //         userId,
    //         ...(categoryId ? { categoryId } : null)
    //       });
    //     })
    //   )
    //   .subscribe(posts => {
    //     this.posts$.next([]);
    //     setTimeout(() => {
    //       this.posts$.next(posts);
    //     }, 0);
    //   });
  }

  ngOnDestroy() {
    [this.routeData$, this.categoriesSwitch$].forEach($ => $?.unsubscribe());
  }

  onResetCategory() {
    // this.categoriesSwitch$.next({ ...[...this.categories$.getValue()].shift(), id: null });
  }
}
