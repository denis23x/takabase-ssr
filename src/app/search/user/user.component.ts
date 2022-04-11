/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { User, UserService, UserGetAllDto } from '../../core';

@Component({
  selector: 'app-search-user',
  templateUrl: './user.component.html'
})
export class SearchUserComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;
  activatedRouteQueryParams$: Subscription;

  page = 1;
  size = 10;

  userList: User[] = [];
  userListHasMore: boolean;
  userListLoading: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((userList: User[]) => {
        this.userList = userList;
        this.userListHasMore = userList.length === this.size;
      });

    this.activatedRouteQueryParams$ = this.activatedRoute.parent.queryParams
      .pipe(
        skip(1),
        tap(() => {
          this.page = 1;
          this.size = 10;

          this.userList = [];
          this.userListLoading = true;
          this.userListHasMore = false;
        })
      )
      .subscribe(() => this.getUserList(false));
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
  }

  getUserList(concat: boolean): void {
    let userGetAllDto: UserGetAllDto = {
      page: this.page,
      size: this.size
    };

    const name: string = String(
      this.activatedRoute.parent.snapshot.queryParamMap.get('query') || ''
    );

    if (name) {
      userGetAllDto = {
        ...userGetAllDto,
        name
      };
    }

    this.userService.getAll(userGetAllDto).subscribe((userList: User[]) => {
      this.userList = concat ? this.userList.concat(userList) : userList;
      this.userListLoading = false;
      this.userListHasMore = userList.length === this.size;
    });
  }

  onUserListLoadMore(): void {
    this.page++;

    this.getUserList(true);
  }
}
