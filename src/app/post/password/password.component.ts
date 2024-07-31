/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ShareComponent } from '../../standalone/components/share/share.component';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PostStore } from '../post.store';
import { PostPasswordService } from '../../core/services/post-password.service';
import type { Post } from '../../core/models/post.model';
import type { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import type { HttpErrorResponse } from '@angular/common/http';

@Component({
	standalone: true,
	imports: [PostProseComponent, ShareComponent],
	providers: [PostPasswordService],
	selector: 'app-post-password',
	templateUrl: './password.component.html'
})
export class PostPasswordComponent implements OnInit {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);

	postPassword: Post | undefined;
	postPasswordRequest$: Subscription | undefined;
	postPasswordSkeletonToggle: boolean = true;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[this.postPasswordRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPassword = this.skeletonService.getPost(['user']);
		this.postPasswordSkeletonToggle = true;
	}

	setResolver(): void {
		const postPasswordId: number = Number(this.activatedRoute.snapshot.paramMap.get('postPasswordId'));
		const postPasswordGetOneDto: PostGetOneDto = {
			scope: ['user']
		};

		this.postPasswordRequest$ = this.postPasswordService
			.getOne(postPasswordId, postPasswordGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(this.router.navigate(['/error', httpErrorResponse.status])).pipe(
						switchMap(() => throwError(() => httpErrorResponse))
					);
				}),
				tap((postPassword: Post) => this.postStore.setPost(postPassword))
			)
			.subscribe({
				next: (postPassword: Post) => {
					this.postPassword = postPassword;
					this.postPasswordSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});
	}
}
