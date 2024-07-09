/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../core/models/post.model';
import { CommonModule } from '@angular/common';
import * as console from 'node:console';
import { Subscription } from 'rxjs';
import { PostStore } from './post.store';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [RouterModule, CommonModule, SvgIconComponent],
	selector: 'app-post',
	templateUrl: './post.component.html'
})
export class PostComponent implements OnInit, OnDestroy {
	private readonly postStore: PostStore = inject(PostStore);

	post: Post | undefined;
	post$: Subscription | undefined;
	postSkeletonToggle: boolean = true;

	ngOnInit(): void {
		this.post$ = this.postStore.getPost().subscribe({
			next: (post: Post) => {
				this.post = post;
				this.postSkeletonToggle = false;
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.post$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
