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
import { PostProseComponent } from '../prose/prose.component';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { Category } from '../../../../core/models/category.model';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent, WindowComponent, PostProseComponent],
	selector: 'app-post-preview, [appPostPreview]',
	templateUrl: './preview.component.html'
})
export class PostPreviewComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('postPreviewDialogElement') postPreviewDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostPreviewToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	set appPostPreviewPost(post: Partial<Post>) {
		this.post = post as Post;
	}

	@Input()
	set appPostPreviewCategory(category: Category) {
		this.category = category;
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	category: Category | undefined;

	post: Post | undefined;
	postPreview: Post | undefined;
	postPreviewDialogToggle: boolean = false;

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

	onTogglePostPreviewDialog(toggle: boolean): void {
		this.appPostPreviewToggle.emit(toggle);

		this.postPreviewDialogToggle = toggle;

		if (toggle) {
			this.postPreviewDialogElement.nativeElement.showModal();
			this.postPreview = {
				...this.post,
				user: this.currentUser,
				category: this.category
			};
		} else {
			this.postPreviewDialogElement.nativeElement.close();
			this.postPreview = undefined;
		}
	}
}
