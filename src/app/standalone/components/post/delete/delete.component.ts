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
import type { Post } from '../../../../core/models/post.model';
import type { PostDeleteDto } from '../../../../core/dto/post/post-delete.dto';

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
	set appPostDeletePostType(postType: string) {
		this.postType = postType;
	}

	post: Post | undefined;
	postType: string = 'public';
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
		const postDeleteDto: PostDeleteDto = {};

		// Attach firebaseUid only if exists

		if (this.post.firebaseUid) {
			postDeleteDto.firebaseUid = this.post.firebaseUid;
		}

		const postTypeMap: Record<string, Observable<Partial<Post>>> = {
			password: this.postPasswordService.delete(postId, postDeleteDto),
			private: this.postPrivateService.delete(postId, postDeleteDto),
			public: this.postService.delete(postId, postDeleteDto)
		};

		this.postDeleteRequest$?.unsubscribe();
		this.postDeleteRequest$ = postTypeMap[this.postType].subscribe({
			next: () => {
				const postTypeRedirectMap: Record<string, string[]> = {
					password: ['password'],
					private: ['private'],
					public: ['category', String(this.post.category?.id)]
				};

				this.router
					.navigate(['/', this.currentUser.displayName, ...postTypeRedirectMap[this.postType]])
					.then(() => this.snackbarService.success('Sadly..', 'Post has been deleted'));
			},
			error: () => this.postDeleteIsSubmitted.set(false)
		});
	}
}
