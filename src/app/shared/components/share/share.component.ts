/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlatformService, Post, SnackbarService } from '../../../core';
import { ActivatedRoute, Data, Params } from '@angular/router';
import { map } from 'rxjs/operators';
import { Share } from '../../../core/models/share.model';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-share, [appShare]',
	templateUrl: './share.component.html'
})
export class ShareComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	shareUrl: string | undefined;
	shareMap: Share = {
		facebook: 'https://facebook.com/sharer/sharer.php',
		linkedin: 'https://linkedin.com/shareArticle',
		pinterest: 'https://pinterest.com/pin/create/button/',
		reddit: 'https://reddit.com/submit/',
		telegram: 'https://telegram.me/share/url',
		twitter: 'https://twitter.com/intent/tweet/'
	};

	constructor(
		private platformService: PlatformService,
		private activatedRoute: ActivatedRoute,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => {
					if (this.platformService.isBrowser()) {
						const window: Window = this.platformService.getWindow();

						this.shareUrl = window.location.href;
					}

					const shareList: string[] = Object.keys(this.shareMap);

					shareList.forEach((share: string) => {
						const params: Params = this.getParams(share, post);
						const encodedURI: string = this.getEncodedURI(params);

						this.shareMap[share] = [this.shareMap[share], encodedURI].join('?');
					});
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	getParams(share: string, post: Post): Params {
		/** https://sharingbuttons.io/ */
		/** https://github.com/bradvin/social-share-urls */
		/** https://www.freeformatter.com/url-parser-query-string-splitter.html */

		switch (share) {
			case 'facebook': {
				return {
					t: post.name,
					u: this.shareUrl
				};
			}
			case 'linkedin': {
				return {
					mini: true,
					url: this.shareUrl,
					title: post.name,
					summary: post.description,
					source: this.shareUrl
				};
			}
			case 'pinterest': {
				return {
					url: this.shareUrl,
					media: this.shareUrl,
					description: post.name
				};
			}
			case 'reddit': {
				return {
					url: this.shareUrl,
					resubmit: true,
					title: post.name
				};
			}
			case 'telegram': {
				return {
					url: this.shareUrl,
					text: post.name
				};
			}
			case 'twitter': {
				return {
					url: this.shareUrl,
					text: post.name
					// via: '',
					// hashtags: ''
				};
			}
			default: {
				return {};
			}
		}
	}

	getEncodedURI(data: any): string {
		// prettier-ignore
		return Object.keys(data).map((key: string) => [key, data[key]].map(encodeURIComponent).join('=')).join('&');
	}

	onCopyUrl(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.navigator.clipboard.writeText(this.shareUrl).then(() => {
				this.snackbarService.success(null, 'Post URL has been copied');
			});
		}
	}
}
