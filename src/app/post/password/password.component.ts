/** @format */

import { Component, ComponentRef, inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PostStore } from '../post.store';
import { PostPasswordService } from '../../core/services/post-password.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import { CookiesService } from '../../core/services/cookies.service';
import { HelperService } from '../../core/services/helper.service';
import type { Post } from '../../core/models/post.model';
import type { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import type { PostPasswordComponent as PostPasswordDialogComponent } from '../../standalone/components/post/password/password.component';
import type { HttpErrorResponse } from '@angular/common/http';

@Component({
	standalone: true,
	imports: [PostProseComponent],
	providers: [PostPasswordService],
	selector: 'app-post-password',
	templateUrl: './password.component.html'
})
export class PostPasswordComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	postPassword: Post | undefined;
	postPasswordRequest$: Subscription | undefined;
	postPasswordSkeletonToggle: boolean = true;

	// Lazy loading

	appPostPasswordComponent: ComponentRef<PostPasswordDialogComponent>;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[this.postPasswordRequest$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPassword = this.skeletonService.getPost(['user']);
		this.postPasswordSkeletonToggle = true;
	}

	setResolver(): void {
		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => {
					const postPasswordId: number = Number(this.activatedRoute.snapshot.paramMap.get('postPasswordId'));
					const postPasswordCookieKey: string = 'post-password-' + postPasswordId;
					const postPasswordCookieValue: string | undefined = this.cookiesService.getItem(postPasswordCookieKey);
					const postPasswordDecrypt: string | undefined = this.helperService.getDecrypt(postPasswordCookieValue);
					const postPasswordGetOneDto: PostGetOneDto = {
						scope: ['user']
					};

					// Attach password only if exists

					if (postPasswordDecrypt) {
						postPasswordGetOneDto.password = postPasswordDecrypt;
					}

					this.postPasswordRequest$?.unsubscribe();
					this.postPasswordRequest$ = this.postPasswordService
						.getOne(postPasswordId, postPasswordGetOneDto)
						.pipe(
							catchError((httpErrorResponse: HttpErrorResponse) => {
								this.cookiesService.removeItem('post-password-' + postPasswordId);

								// Show post password dialog

								return from(this.onTogglePostDeleteDialog()).pipe(switchMap(() => throwError(() => httpErrorResponse)));
							}),
							tap((postPassword: Post | null) => {
								if (!postPassword) {
									this.onTogglePostDeleteDialog()
										.then(() => console.debug('Prompt password'))
										.catch((error: any) => console.error(error));
								}

								return postPassword;
							}),
							filter((postPassword: Post | null) => !!postPassword),
							tap((postPassword: Post) => this.postStore.setPost(postPassword))
						)
						.subscribe({
							next: (postPassword: Post) => {
								this.postPassword = postPassword;
								this.postPasswordSkeletonToggle = false;
							},
							error: (error: any) => console.error(error)
						});
				},
				error: (error: any) => console.error(error)
			});
	}

	/** LAZY */

	async onTogglePostDeleteDialog(): Promise<void> {
		if (!this.appPostPasswordComponent) {
			await import('../../standalone/components/post/password/password.component').then(m => {
				this.appPostPasswordComponent = this.viewContainerRef.createComponent(m.PostPasswordComponent);

				// Redirect when close without password

				this.appPostPasswordComponent.instance.appPostPasswordToggle
					.pipe(filter((toggle: boolean) => !toggle && this.postPasswordSkeletonToggle))
					.subscribe({
						next: () => this.router.navigate(['/error', 403], { skipLocationChange: true }),
						error: (error: any) => console.error(error)
					});

				// Receive post password

				this.appPostPasswordComponent.instance.appPostPasswordSuccess
					.pipe(
						filter((postPassword: Post | null) => !!postPassword),
						tap((postPassword: Post) => this.postStore.setPost(postPassword))
					)
					.subscribe({
						next: (postPassword: Post) => {
							this.postPassword = postPassword;
							this.postPasswordSkeletonToggle = false;
						},
						error: (error: any) => console.error(error)
					});
			});
		}

		this.appPostPasswordComponent.changeDetectorRef.detectChanges();
		this.appPostPasswordComponent.instance.onTogglePostPasswordDialog(true);
	}
}
