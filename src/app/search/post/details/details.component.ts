/** @format */

import { Component } from '@angular/core';
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostDetailComponent } from '../../../standalone/components/post/prose/prose.component';
import { AbstractPostDetailsComponent } from '../../../abstracts/abstract-post-details.component';

@Component({
	standalone: true,
	imports: [WindowComponent, PostDetailComponent, ShareComponent],
	selector: 'app-search-post-details',
	templateUrl: './details.component.html'
})
export class SearchPostDetailsComponent extends AbstractPostDetailsComponent {}
