/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { UserService, PostService, CategoriesService, UserProfile } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class UsersDetailResolverService {
  constructor(
    private router: Router,
    private userService: UserService,
    private categoriesService: CategoriesService,
    private postService: PostService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserProfile> {
    return this.userService.currentUser.pipe(
      take(1),
      switchMap(currentUser => {
        const userId = route.data.isProfile ? currentUser.id : route.paramMap.get('id');
        const body = {
          userId
        };

        return forkJoin([
          this.userService.getById(Number(userId)),
          this.categoriesService.getAll(body),
          this.postService.getAll(body)
        ]).pipe(map(([user, categoryList, postList]) => ({ user, categoryList, postList })));
      })
    );
  }
}
