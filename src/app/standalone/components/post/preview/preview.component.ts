/** @format */

import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PostProseComponent } from '../prose/prose.component';
import { CurrentUserMixin } from '../../../../core/mixins/current-user.mixin';
import dayjs from 'dayjs/esm';
import type { Category } from '../../../../core/models/category.model';
import type { Post } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent, PostProseComponent],
	selector: 'app-post-preview, [appPostPreview]',
	templateUrl: './preview.component.html'
})
export class PostPreviewComponent extends CurrentUserMixin(class {}) implements OnInit, OnDestroy {
	@ViewChild('postPreviewDialogElement') postPreviewDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostPreviewToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostPreviewPost(post: Partial<Post>) {
		this.post = post as Post;
	}

	@Input({ required: true })
	set appPostPreviewPostType(postType: string) {
		this.postType = postType;
	}

	@Input({ required: true })
	set appPostPreviewCategory(category: Category) {
		this.category = category;
	}

	category: Category | undefined;

	post: Post | undefined;
	postType: string = 'public';
	postPreview: Post | undefined;
	postPreviewDialogToggle: boolean = false;

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	onTogglePostPreviewDialog(toggle: boolean): void {
		this.postPreviewDialogToggle = toggle;

		if (toggle) {
			this.postPreviewDialogElement.nativeElement.showModal();
			this.postPreview = {
				...this.post,
				user: {
					id: 0,
					name: this.currentUser.displayName,
					description: null,
					avatar: this.currentUser.photoURL,
					createdAt: dayjs().toISOString(),
					updatedAt: dayjs().toISOString()
				},
				category: this.category
			};
		} else {
			this.postPreviewDialogElement.nativeElement.close();
			this.postPreview = undefined;
		}

		this.appPostPreviewToggle.emit(toggle);
	}
}
