/** @format */

import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appPlatform]'
})
export class PlatformDirective implements OnInit {
	private readonly templateRef: TemplateRef<any> = inject(TemplateRef);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	@Input({ required: true })
	set appPlatform(platform: string) {
		this.platform = platform;
	}

	platform: string | undefined;

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
