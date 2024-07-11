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
import { Post } from '../../../../core/models/post.model';
import { PostService } from '../../../../core/services/post.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Router } from '@angular/router';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { Location } from '@angular/common';
import { PostDeleteDto } from '../../../../core/dto/post/post-delete.dto';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent],
	selector: 'app-post-delete, [appPostDelete]',
	templateUrl: './delete.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDeleteComponent implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly postService: PostService = inject(PostService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
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

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	post: Post | undefined;
	postDeleteRequest$: Subscription | undefined;
	postDeleteDialogToggle: boolean = false;
	postDeleteIsSubmitted: WritableSignal<boolean> = signal(false);

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onTogglePostDeleteDialog(false));
		}
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.postDeleteRequest$].forEach(($: Subscription) => $?.unsubscribe());
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

		const postId: number = this.post.id;
		const postDeleteDto: PostDeleteDto = {
			firebaseUid: this.post.firebaseUid
		};

		// Attach only if exists (querystring parse issue)

		if (this.post.image) {
			postDeleteDto.image = this.post.image;
		}

		this.postDeleteRequest$?.unsubscribe();
		this.postDeleteRequest$ = this.postService.delete(postId, postDeleteDto).subscribe({
			next: () => {
				this.router
					.navigate(['/', this.post.user.name, 'category', this.post.category.id])
					.then(() => this.snackbarService.success('Sadly..', 'Post has been deleted'));
			},
			error: () => this.postDeleteIsSubmitted.set(false)
		});
	}
}
