/** @format */

import { Component, ComponentRef, inject, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { DropdownComponent } from '../../dropdown/dropdown.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { HelperService } from '../../../../core/services/helper.service';
import { MarkdownRenderDirective } from '../../../directives/app-markdown-render.directive';
import { MarkdownTimeToReadPipe } from '../../../pipes/markdown-time-to-read.pipe';
import { FirebaseStoragePipe } from '../../../pipes/firebase-storage.pipe';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { filter } from 'rxjs/operators';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
import type { QRCodeComponent } from '../../qr-code/qr-code.component';
import type { Post } from '../../../../core/models/post.model';
import type { PostExternalLinkComponent } from '../external-link/external-link.component';
import { AvatarComponent } from '../../avatar/avatar.component';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		DayjsPipe,
		NgOptimizedImage,
		SkeletonDirective,
		DropdownComponent,
		SvgIconComponent,
		MarkdownRenderDirective,
		MarkdownTimeToReadPipe,
		FirebaseStoragePipe,
		AvatarComponent
	],
	providers: [MarkdownService],
	selector: 'app-post-prose, [appPostProse]',
	templateUrl: './prose.component.html'
})
export class PostProseComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	@Input({ required: true })
	set appPostProsePost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPostProsePostType(postType: string) {
		this.postType = postType;
	}

	@Input()
	set appPostProsePreview(postPreview: boolean) {
		this.postPreview = postPreview;
	}

	@Input()
	set appPostProsePostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	post: Post | undefined;
	postType: string = 'public';
	postPreview: boolean = false;
	postSkeletonToggle: boolean = true;

	// Lazy loading

	appQRCodeComponent: ComponentRef<QRCodeComponent>;
	appPostExternalLinkComponent: ComponentRef<PostExternalLinkComponent>;

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	async onToggleQRCodeDialog(): Promise<void> {
		if (!this.appQRCodeComponent) {
			await import('../../qr-code/qr-code.component')
				.then(m => (this.appQRCodeComponent = this.viewContainerRef.createComponent(m.QRCodeComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appQRCodeComponent.setInput('appQRCodeData', this.helperService.getURL().toString());

		this.appQRCodeComponent.changeDetectorRef.detectChanges();
		this.appQRCodeComponent.instance.onToggleQRCodeDialog(true);
	}

	async onTogglePostExternalLinkDialog(href: string): Promise<void> {
		if (!this.appPostExternalLinkComponent) {
			await import('../../post/external-link/external-link.component')
				.then(m => {
					this.appPostExternalLinkComponent = this.viewContainerRef.createComponent(m.PostExternalLinkComponent);
					this.appPostExternalLinkComponent.instance.appPostExternalLinkSubmit
						.pipe(filter(() => this.postType === 'public'))
						.subscribe({
							next: () => this.platformService.getWindow().open(href, '_blank'),
							error: (error: any) => console.error(error)
						});
				})
				.catch((error: any) => console.error(error));
		}

		this.appPostExternalLinkComponent.changeDetectorRef.detectChanges();
		this.appPostExternalLinkComponent.instance.onTogglePostExternalLinkDialog(true);
	}
}
