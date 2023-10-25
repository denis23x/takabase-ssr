/** @format */

import { Component, OnInit } from '@angular/core';
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostDetailComponent } from '../../../standalone/components/post/prose/prose.component';
import { AbstractPostDetailsComponent } from '../../../abstracts/abstract-post-details.component';
import { PostGetOneDto } from '../../../core/dto/post/post-get-one.dto';

@Component({
	standalone: true,
	imports: [WindowComponent, PostDetailComponent, ShareComponent],
	selector: 'app-user-post-details',
	templateUrl: './details.component.html'
})
export class UserPostDetailsComponent extends AbstractPostDetailsComponent implements OnInit {
	ngOnInit(): void {
		super.ngOnInit();

		/** Request */

		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postGetOneDto: PostGetOneDto = {
			userId: 1,
			scope: ['user', 'category']
		};

		this.getAbstractPost(postId, postGetOneDto);
	}
}
