/** @format */

import { Component, OnInit } from '@angular/core';
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostProseComponent } from '../../../standalone/components/post/prose/prose.component';
import { AbstractPostDetailsComponent } from '../../../abstracts/abstract-post-details.component';
import { PostGetOneDto } from '../../../core/dto/post/post-get-one.dto';

@Component({
	standalone: true,
	imports: [WindowComponent, PostProseComponent, ShareComponent],
	selector: 'app-user-post-details',
	templateUrl: './details.component.html'
})
export class UserPostDetailsComponent extends AbstractPostDetailsComponent implements OnInit {
	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setResolver();
	}

	setResolver(): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId') || '');

		// prettier-ignore
		const categoryId: number = Number(this.activatedRoute.parent.snapshot.paramMap.get('categoryId') || '');

		const postGetOneDto: PostGetOneDto = {
			categoryId,
			scope: ['user', 'category']
		};

		this.getAbstractPost(postId, postGetOneDto);
	}
}
