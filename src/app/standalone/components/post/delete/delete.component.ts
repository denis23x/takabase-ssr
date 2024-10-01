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
import { Observable, Subscription } from 'rxjs';
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
	private readonly postService: PostService = inject(PostService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@ViewChild('postDeleteDialogElement') postDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostDeleteSuccess: EventEmitter<Partial<Post>> = new EventEmitter<Partial<Post>>();
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
			next: (post: Partial<Post>) => {
				this.snackbarService.success('Sadly..', 'Post has been deleted');

				this.appPostDeleteSuccess.emit(post);

				this.postDeleteIsSubmitted.set(false);

				this.onTogglePostDeleteDialog(false);
			},
			error: () => this.postDeleteIsSubmitted.set(false)
		});
	}
}
