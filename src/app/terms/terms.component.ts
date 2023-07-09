/** @format */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AppScrollIntoViewDirective,
		SvgIconComponent
	],
	selector: 'app-terms',
	templateUrl: './terms.component.html'
})
export class TermsComponent implements OnInit {
	termsNavigationList: any[] = [
		{
			path: 'terms-of-use',
			name: 'Terms of use'
		},
		{
			path: 'cookie-policy',
			name: 'Cookie policy'
		}
	];

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private metaService: MetaService
	) {}

	ngOnInit(): void {
		this.setMeta();
	}

	setMeta(): void {
		const title: string = 'Terms of use';

		// prettier-ignore
		const description: string = 'Read our terms of use to understand the rules and guidelines for using Draft.';

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		// prettier-ignore
		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}
}
