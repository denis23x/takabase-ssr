/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PostService } from '../../../../core/services/post.service';
import { PostPasswordService } from '../../../../core/services/post-password.service';
import { PostPrivateService } from '../../../../core/services/post-private.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlatformService } from '../../../../core/services/platform.service';
import { Location } from '@angular/common';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
import type { Post, PostType } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent],
	providers: [PostService, PostPasswordService, PostPrivateService],
	selector: 'app-post-delete, [appPostDelete]',
	templateUrl: './delete.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDeleteComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly postService: PostService = inject(PostService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	@ViewChild('postDeleteDialogElement') postDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostDeleteSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appPostDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostDeletePost(post: Post) {
		this.post = post;
	}

	@Input({ required: true })
	set appPostDeletePostType(postType: PostType) {
		this.postType = postType;
	}

	post: Post | undefined;
	postType: PostType = 'category';
	postDeleteRequest$: Subscription | undefined;
	postDeleteDialogToggle: boolean = false;
	postDeleteIsSubmitted: WritableSignal<boolean> = signal(false);

	ngOnInit(): void {
		super.ngOnInit();

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onTogglePostDeleteDialog(false));
		}
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.postDeleteRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onTogglePostDeleteDialog(toggle: boolean): void {
		this.postDeleteDialogToggle = toggle;

		if (toggle) {
			this.postDeleteDialogElement.nativeElement.showModal();
		} else {
			this.postDeleteDialogElement.nativeElement.close();
		}

		this.appPostDeleteToggle.emit(toggle);
	}

	onSubmitPostDelete(): void {
		this.postDeleteIsSubmitted.set(true);

		// Delete

		const postId: number = this.post.id;
		const postTypeMap: Record<PostType, Observable<Partial<Post>>> = {
			category: this.postService.delete(postId),
			password: this.postPasswordService.delete(postId),
			private: this.postPrivateService.delete(postId)
		};

		this.postDeleteRequest$?.unsubscribe();
		this.postDeleteRequest$ = postTypeMap[this.postType].subscribe({
			next: () => {
				// prettier-ignore
				this.router
					.navigate(['/', this.currentUser.displayName, this.postType, String(this.post.category?.id || '')].filter((command: string) => !!command))
					.then(() => this.snackbarService.success('Sadly..', 'Post has been deleted'));
			},
			error: () => this.postDeleteIsSubmitted.set(false)
		});
	}
}
