/** @format */

import { Component } from '@angular/core';
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostDetailComponent } from '../../../standalone/components/post/prose/prose.component';
import { AbstractDetailsComponent } from '../../../abstracts/abstract-details.component';

@Component({
	standalone: true,
	imports: [WindowComponent, PostDetailComponent, ShareComponent],
	selector: 'app-user-post-details',
	templateUrl: './details.component.html'
})
export class UserPostDetailsComponent extends AbstractDetailsComponent {}
