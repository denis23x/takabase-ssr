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
	selector: 'app-search-post-details',
	templateUrl: './details.component.html'
})
export class SearchPostDetailsComponent extends AbstractPostDetailsComponent implements OnInit {
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
