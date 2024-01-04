/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { Post } from '../../../../core/models/post.model';
import { PostService } from '../../../../core/services/post.service';
import { FileService } from '../../../../core/services/file.service';
import { UserService } from '../../../../core/services/user.service';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { Router } from '@angular/router';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../../../../core/services/authorization.service';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent, WindowComponent],
	selector: 'app-post-delete, [appPostDelete]',
	templateUrl: './delete.component.html'
})
export class PostDeleteComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('postDeleteDialogElement') postDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostDeleteSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
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
	postDeleteIsSubmitted: boolean = false;

	constructor(
		private router: Router,
		private userService: UserService,
		private postService: PostService,
		private fileService: FileService,
		private authorizationService: AuthorizationService,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});
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
		this.postDeleteIsSubmitted = true;

		const postId: number = this.post.id;

		this.postDeleteRequest$?.unsubscribe();
		this.postDeleteRequest$ = this.postService.delete(postId).subscribe({
			next: (post: Post) => {
				if (post.image) {
					this.fileService.delete(post.image).subscribe({
						next: () => console.debug('File erased'),
						error: (error: any) => console.error(error)
					});
				}

				this.router
					.navigate([this.userService.getUserUrl(this.currentUser)])
					.then(() => this.snackbarService.success('Sadly..', 'Post has been deleted'));
			},
			error: () => (this.postDeleteIsSubmitted = false)
		});
	}
}
