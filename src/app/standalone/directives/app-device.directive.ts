/** @format */

import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appDevice]'
})
export class DeviceDirective implements OnInit {
	private readonly templateRef: TemplateRef<any> = inject(TemplateRef);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	@Input({ required: true })
	set appDevice(device: string) {
		this.device = device;
	}

	device: string | undefined;

	ngOnInit(): void {
		if (this.getDevice()) {
			this.viewContainerRef.createEmbeddedView(this.templateRef);
		} else {
			this.viewContainerRef.clear();
		}
	}

	getDevice(): boolean {
		switch (this.device) {
			case 'mobile':
				return this.platformService.isMobile();
			case 'desktop':
				return this.platformService.isMobile() === false;
			default:
				throw new Error('Invalid device specified: ' + this.device);
		}
	}
}
