/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UserGetAllDto, User, UserService } from '../../core';

@Component({
  selector: 'app-search-users',
  templateUrl: './users.component.html'
})
export class SearchUsersComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;

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
    this.routeData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe((userList: User[]) => {
      this.userList = userList;
      this.userListHasMore = userList.length === this.size;
    });

    this.routeQueryParams$ = this.activatedRoute.parent.queryParams
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
    [this.routeData$, this.routeQueryParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getUserList(concat: boolean): void {
    let userGetAllDto: UserGetAllDto = {
      page: this.page,
      size: this.size
    };

    const { query: name = null } = this.activatedRoute.parent.snapshot.queryParams;

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
