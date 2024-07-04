/** @format */

import { Component, OnInit } from '@angular/core';
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostProseComponent } from '../../../standalone/components/post/prose/prose.component';
import { AbstractPostComponent } from '../../../abstracts/abstract-post.component';
import { PostGetOneDto } from '../../../core/dto/post/post-get-one.dto';

@Component({
	standalone: true,
	imports: [WindowComponent, PostProseComponent, ShareComponent],
	selector: 'app-user-private-details',
	templateUrl: './details.component.html'
})
export class UserPrivateDetailsComponent extends AbstractPostComponent implements OnInit {
	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setResolver();
	}

	setResolver(): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postGetOneDto: PostGetOneDto = {
			scope: ['user', 'category']
		};

		this.getAbstractPost(postId, postGetOneDto);
	}
}
