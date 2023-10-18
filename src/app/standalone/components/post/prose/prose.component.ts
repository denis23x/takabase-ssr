/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';
import { UserUrlPipe } from '../../../pipes/user-url.pipe';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { SanitizerPipe } from '../../../pipes/sanitizer.pipe';
import { CurrentUser } from '../../../../core/models/current-user.model';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		MarkdownPipe,
		UserUrlPipe,
		DayjsPipe,
		NgOptimizedImage,
		SanitizerPipe
	],
	selector: 'app-post-prose, [appPostProse]',
	templateUrl: './prose.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
	@Input()
	set appPost(post: Post) {
		this.post = post;
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	post: Post | undefined;

	constructor(private authorizationService: AuthorizationService) {}

	ngOnInit(): void {
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.currentUser$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
