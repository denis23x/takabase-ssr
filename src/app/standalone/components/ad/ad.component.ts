/** @format */

import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	selector: 'app-ad, [appAd]',
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './ad.component.html'
})
export class AdComponent {
	@Input()
	set appAdFormat(adFormat: string) {
		this.adFormat = adFormat;
	}

	@Input()
	set appAdLayout(adLayout: string) {
		this.adLayout = adLayout;
	}

	@Input()
	set appAdLayoutKey(adLayoutKey: string) {
		this.adLayoutKey = adLayoutKey;
	}

	@Input()
	set appAdClient(adClient: string) {
		this.adClient = adClient;
	}

	@Input()
	set appAdSlot(adSlot: string) {
		this.adSlot = adSlot;
	}

	adFormat: string | undefined;
	adLayoutKey: string | undefined;
	adLayout: string | undefined;
	adClient: string | undefined;
	adSlot: string | undefined;
}
