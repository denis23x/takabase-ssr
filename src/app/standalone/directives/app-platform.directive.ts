/** @format */

import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appPlatform]'
})
export class AppPlatformDirective implements OnInit {
	@Input({ required: true })
	set appPlatform(platform: string) {
		this.platform = platform;
	}

	platform: string | undefined;

	constructor(
		private templateRef: TemplateRef<any>,
		private platformService: PlatformService,
		private viewContainerRef: ViewContainerRef
	) {}

	ngOnInit(): void {
		if (this.getPlatform()) {
			this.viewContainerRef.createEmbeddedView(this.templateRef);
		} else {
			this.viewContainerRef.clear();
		}
	}

	getPlatform(): boolean {
		switch (this.platform) {
			case 'browser':
				return this.platformService.isBrowser();
			case 'server':
				return this.platformService.isServer();
			default:
				return false;
		}
	}
}
