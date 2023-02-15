/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { UserUrlPipe } from '../../../pipes/user-url.pipe';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		MarkdownPipe,
		UserUrlPipe,
		DayjsPipe
	],
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
