/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { TitleService } from '../core/services/title.service';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);

	statusCode: number | undefined;
	statusCodeMap: number[][] = [
		[100, 199],
		[200, 299],
		[300, 399],
		[400, 499],
		[500, 599]
	];

	message: string | undefined;
	messageMap: string[] = [
		'Information message',
		'Success',
		'Redirect',
		'Client error',
		'Server error'
	];

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();

		/** Apply title */

		this.titleService.setTitle([this.statusCode, this.message].join(' '));
	}

	setResolver(): void {
		const statusCode: number = Number(this.activatedRoute.snapshot.paramMap.get('status'));
		const message: string = this.getMessageMap(statusCode);

		if (!statusCode || !message) {
			this.router.navigate([[], 520]).then(() => console.debug('Route changed'));
		}

		this.statusCode = statusCode;
		this.message = message;
	}

	setMetaTags(): void {
		const title: string = this.message;
		const description: string = "Oops! It looks like you've landed on an error page";

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

	getMessageMap(status: number): string | undefined {
		const index: number = this.statusCodeMap.findIndex(([min, max]: number[]) => {
			return min <= status === status < max;
		});

		return this.messageMap[index];
	}
}
