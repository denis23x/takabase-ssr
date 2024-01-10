/** @format */

import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
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
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { filter } from 'rxjs/operators';
import { PostDeleteComponent } from '../delete/delete.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { QrCodeComponent } from '../../qr-code/qr-code.component';
import { ReportService } from '../../../../core/services/report.service';

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
		SanitizerPipe,
		SkeletonDirective,
		DropdownComponent,
		SvgIconComponent,
		PostDeleteComponent,
		QrCodeComponent
	],
	selector: 'app-post-prose, [appPostProse]',
	templateUrl: './prose.component.html'
})
export class PostProseComponent implements OnInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@Input({ required: true })
	set appPostProsePost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPostProsePreview(postPreview: boolean) {
		this.postPreview = postPreview;
	}

	@Input()
	set appPostProsePostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	post: Post | undefined;
	postPreview: boolean = false;
	postShareUrl: string | undefined;
	postSkeletonToggle: boolean = true;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.postShareUrl = window.location.origin + window.location.pathname;
		}

		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onCopyUrl(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.navigator.clipboard
				.writeText(this.postShareUrl)
				.then(() => this.snackbarService.success(null, 'Post URL has been copied'))
				.catch(() => this.snackbarService.error(null, 'Failed to copy'));
		}
	}

	onToggleReportDialog(toggle: boolean): void {
		this.reportService.reportDialogToggle$.next(toggle);
	}
}
