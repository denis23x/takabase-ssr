/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, Post, User } from '../../../../core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription | undefined;

  user$: Subscription | undefined;
  user: User | undefined;

  post: Post | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(map((data: Data) => data.data))
      .subscribe({
        next: (post: Post) => (this.post = post),
        error: (error: any) => console.error(error)
      });

    this.user$ = this.authService.userSubject.subscribe({
      next: (user: User) => (this.user = user),
      error: (error: any) => console.error(error)
    });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.user$].forEach($ => $?.unsubscribe());
  }

  onClose(): void {
    this.router
      .navigate(['..'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'preserve'
      })
      .then(() => console.debug('Route changed'));
  }
}
