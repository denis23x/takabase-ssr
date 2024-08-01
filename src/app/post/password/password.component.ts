/** @format */

import { Component, ComponentRef, inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PostStore } from '../post.store';
import { PostPasswordService } from '../../core/services/post-password.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import type { Post } from '../../core/models/post.model';
import type { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import type { HttpErrorResponse } from '@angular/common/http';
import type { PostPasswordComponent as PostPasswordDialogComponent } from '../../standalone/components/post/password/password.component';

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
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	postPassword: Post | undefined;
	postPasswordRequest$: Subscription | undefined;
	postPasswordProvidedValue: string | undefined;
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
					const postPasswordGetOneDto: PostGetOneDto = {
						scope: ['user']
					};

					// Attach password

					if (this.postPasswordProvidedValue) {
						postPasswordGetOneDto.password = this.postPasswordProvidedValue;
					}

					// Request

					this.postPasswordRequest$?.unsubscribe();
					this.postPasswordRequest$ = this.postPasswordService
						.getOne(postPasswordId, postPasswordGetOneDto)
						.pipe(
							catchError((httpErrorResponse: HttpErrorResponse) => {
								// prettier-ignore
								if (postPasswordGetOneDto.password) {
									return from(this.router.navigate(['/error', 403])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
								} else {
									return from(this.onTogglePostDeleteDialog()).pipe(switchMap(() => throwError(() => httpErrorResponse)));
								}
							}),
							tap((postPassword: Post) => this.postStore.setPost(postPassword))
						)
						.subscribe({
							next: (postPassword: Post) => {
								this.postPassword = postPassword;
								this.postPasswordSkeletonToggle = false;

								if (postPasswordGetOneDto.password) {
									this.snackbarService.success('Ok', 'Access granted');
								}
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
					.pipe(
						filter((toggle: boolean) => !toggle && !this.postPasswordProvidedValue),
						take(1)
					)
					.subscribe({
						next: () => this.router.navigate(['/error', 403]),
						error: (error: any) => console.error(error)
					});

				// Re-call resolver with password

				this.appPostPasswordComponent.instance.appPostPasswordSuccess
					.pipe(
						tap((password: string) => (this.postPasswordProvidedValue = password)),
						tap(() => this.appPostPasswordComponent.instance.onTogglePostPasswordDialog(false))
					)
					.subscribe({
						next: () => this.setResolver(),
						error: (error: any) => console.error(error)
					});
			});
		}

		this.appPostPasswordComponent.changeDetectorRef.detectChanges();
		this.appPostPasswordComponent.instance.onTogglePostPasswordDialog(true);
	}
}
