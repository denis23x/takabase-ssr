/** @format */

import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { HelperService } from '../../../../core/services/helper.service';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { SvgLogoComponent } from '../../svg-logo/svg-logo.component';
import { PlatformService } from '../../../../core/services/platform.service';
import type { Post } from '../../../../core/models/post.model';
import type { Params } from '@angular/router';

@Component({
	standalone: true,
	imports: [SvgIconComponent, SkeletonDirective, SvgLogoComponent],
	selector: 'app-post-share, [appPostShare]',
	templateUrl: './share.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostShareComponent {
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);

	@Input({ required: true })
	set appPostSharePost(post: Post | undefined) {
		if (post) {
			this.post = post;

			const shareData: ShareData = {
				title: this.post.name,
				text: this.post.description,
				url: this.helperService.getURL().toString()
			};

			this.shareDataCanShare = this.platformService.isCanShare(shareData);
			this.shareData = this.shareDataCanShare ? shareData : undefined;

			this.setShareList();
		}
	}

	@Input()
	set appPostSharePostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	post: Post | undefined;
	postSkeletonToggle: boolean = true;

	shareData: ShareData | undefined;
	shareDataCanShare: boolean = false;

	shareList: Record<string, string> = {};
	shareListDefault: Record<string, string> = {
		facebook: 'https://facebook.com/sharer/sharer.php',
		linkedin: 'https://linkedin.com/shareArticle',
		pinterest: 'https://pinterest.com/pin/create/button/',
		twitter: 'https://twitter.com/intent/tweet'
	};

	getEncodedURI(params: Params): string {
		return Object.keys(params)
			.map((key: string) => [key, params[key]].map(encodeURIComponent).join('='))
			.join('&');
	}

	getShareListParams(shareKey: string): Params | null {
		const url: URL = this.helperService.getURL();

		/** https://svgporn.com */
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
			case 'twitter': {
				return {
					url: url.href,
					text: this.post.name,
					hashtags: ['takabase'],
					via: this.post.user.name
				};
			}
			default: {
				throw new Error('Invalid share key specified: ' + shareKey);
			}
		}
	}

	setShareList(): void {
		this.shareList = {
			...this.shareListDefault
		};

		Object.keys(this.shareList).forEach((shareKey: string) => {
			const params: Params | null = this.getShareListParams(shareKey);
			const encodedURI: string = this.getEncodedURI(params);

			this.shareList[shareKey] = [this.shareList[shareKey], encodedURI].join('?');
		});
	}

	setShareNative(): void {
		if (this.platformService.isBrowser()) {
			navigator
				.share(this.shareData)
				.then(() => console.debug('Shared through native share'))
				.catch((error: any) => console.error(error));
		}
	}
}
