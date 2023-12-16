/** @format */

import { Component, Input } from '@angular/core';
import { Params } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { PlatformService } from '../../../core/services/platform.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Post } from '../../../core/models/post.model';
import { HelperService } from '../../../core/services/helper.service';

@Component({
	standalone: true,
	imports: [SvgIconComponent],
	selector: 'app-share, [appShare]',
	templateUrl: './share.component.html'
})
export class ShareComponent {
	@Input({ required: true })
	set appSharePost(post: Post) {
		this.post = post;

		this.setShareList();
	}

	post: Post | undefined;

	shareList: Record<string, string> = {};
	shareListDefault: Record<string, string> = {
		facebook: 'https://facebook.com/sharer/sharer.php',
		linkedin: 'https://linkedin.com/shareArticle',
		pinterest: 'https://pinterest.com/pin/create/button/',
		reddit: 'https://reddit.com/submit/',
		telegram: 'https://t.me/share/url',
		twitter: 'https://twitter.com/intent/tweet'
	};

	constructor(
		private platformService: PlatformService,
		private snackbarService: SnackbarService,
		private helperService: HelperService
	) {}

	getEncodedURI(params: Params): string {
		return Object.keys(params)
			.map((key: string) => [key, params[key]].map(encodeURIComponent).join('='))
			.join('&');
	}

	getShareListParams(shareKey: string): Params | null {
		const url: URL = this.helperService.getURL();

		/** https://sharingbuttons.io/ */
		/** https://github.com/bradvin/social-share-urls */
		/** https://www.freeformatter.com/url-parser-query-string-splitter.html */

		switch (shareKey) {
			case 'facebook': {
				return {
					t: this.post.name,
					u: url.href
				};
			}
			case 'linkedin': {
				return {
					mini: true,
					url: url.href,
					title: this.post.name,
					summary: this.post.description,
					source: url.href
				};
			}
			case 'pinterest': {
				return {
					url: url.href,
					media: url.href,
					description: this.post.name
				};
			}
			case 'reddit': {
				return {
					url: url.href,
					resubmit: true,
					title: this.post.name
				};
			}
			case 'telegram': {
				return {
					url: url.href,
					text: this.post.name
				};
			}
			case 'twitter': {
				return {
					url: url.href,
					text: this.post.name,
					hashtags: ['draft', this.post.category.name],
					via: this.post.user.name
				};
			}
			default: {
				return null;
			}
		}
	}

	setShareList(): void {
		this.shareList = this.shareListDefault;

		Object.keys(this.shareList).forEach((shareKey: string) => {
			const params: Params | null = this.getShareListParams(shareKey);
			const encodedURI: string = this.getEncodedURI(params);

			this.shareList[shareKey] = [this.shareList[shareKey], encodedURI].join('?');
		});
	}

	onCopyUrl(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.navigator.clipboard
				.writeText(window.location.href)
				.then(() => this.snackbarService.success(null, 'Post URL has been copied'))
				.catch(() => this.snackbarService.error(null, 'Failed to copy'));
		}
	}
}
