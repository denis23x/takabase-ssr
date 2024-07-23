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
import { PostPasswordService } from '../../core/services/post-password.service';
import type { PostPassword } from '../../core/models/post-password.model';
import type { PostPasswordGetAllDto } from '../../core/dto/post-password/post-password-get-all.dto';

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
	providers: [PostPasswordService],
	selector: 'app-user-password',
	templateUrl: './password.component.html'
})
export class UserPasswordComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);

	postPasswordList: PostPassword[] = [];
	postPasswordListSkeletonToggle: boolean = true;
	postPasswordListIsLoading: boolean = false;
	postPasswordListRequest$: Subscription | undefined;
	postPasswordListGetAllDto: PostPasswordGetAllDto = {
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
		[this.currentUser$, this.currentUserSkeletonToggle$, this.postPasswordListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPasswordList = this.skeletonService.getPostList();
		this.postPasswordListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getPostList();
	}

	/** PostList */

	getPostList(postPasswordListLoadMore: boolean = false): void {
		const postPasswordGetAllDto: PostPasswordGetAllDto = {
			page: 1,
			size: 20
		};

		this.postPasswordService.getAll(postPasswordGetAllDto).subscribe({
			next: (postPasswordList: PostPassword[]) => {
				console.log(postPasswordList);

				this.postPasswordList = postPasswordList;
				this.postPasswordListSkeletonToggle = false;
			},
			error: (error: any) => console.error(error)
		});
	}
}
