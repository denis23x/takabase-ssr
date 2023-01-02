/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthService, Post, User } from '../../../../core';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-post-detail, [appPostDetail]',
	templateUrl: './detail.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
	@Input()
	set appPost(post: Post) {
		this.post = post;
	}

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	post: Post | undefined;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $?.unsubscribe());
	}
}
