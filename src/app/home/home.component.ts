/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, CommonModule],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	readMoreList: any[] = [
		{
			name: 'Showcase',
			id: 15615
		},
		{
			name: 'Code tutorials',
			id: 15615
		},
		{
			name: 'Deep dive',
			id: 15615
		},
		{
			name: 'Road map',
			id: 15615
		}
	];

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
