/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { PostPrivateService } from '../../core/services/post-private.service';
import type { PostPrivate } from '../../core/models/post-private.model';
import type { PostPrivateGetAllDto } from '../../core/dto/post-private/post-private-get-all.dto';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	providers: [PostPrivateService],
	selector: 'app-user-private',
	templateUrl: './private.component.html'
})
export class UserPrivateComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);

	postPrivateList: PostPrivate[] = [];
	postPrivateListSkeletonToggle: boolean = true;
	postPrivateListIsLoading: boolean = false;
	postPrivateListRequest$: Subscription | undefined;
	postPrivateListGetAllDto: PostPrivateGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.currentUser$, this.currentUserSkeletonToggle$, this.postPrivateListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPrivateList = this.skeletonService.getPostList();
		this.postPrivateListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getPostList();
	}

	/** PostList */

	getPostList(postPrivateListLoadMore: boolean = false): void {
		const postPrivateGetAllDto: PostPrivateGetAllDto = {
			page: 1,
			size: 20
		};

		this.postPrivateService.getAll(postPrivateGetAllDto).subscribe({
			next: (postPrivateList: PostPrivate[]) => {
				this.postPrivateList = postPrivateList;
				this.postPrivateListSkeletonToggle = false;
			},
			error: (error: any) => console.error(error)
		});
	}
}
