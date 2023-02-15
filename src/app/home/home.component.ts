/** @format */

import { Component, OnInit } from '@angular/core';
import { MetaOpenGraph, MetaService, MetaTwitter } from '../core';
import { RouterModule } from '@angular/router';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { SvgIconComponent } from '../shared/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, EmojiModule],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	constructor(private metaService: MetaService) {}

	ngOnInit(): void {
		this.setMeta();
	}

	setMeta(): void {
		const title: string = 'Draft';

		// prettier-ignore
		const description: string = 'Stay up to date with the latest posts and insights from Draft';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}
}
