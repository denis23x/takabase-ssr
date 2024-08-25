/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { TitleService } from '../core/services/title.service';
import { HelperService } from '../core/services/helper.service';
import { RESPONSE } from '../core/tokens/express.tokens';
import { PlatformService } from '../core/services/platform.service';
import type { Response } from 'express';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

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
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly response: Response | null = inject(RESPONSE, { optional: true });

	statusCode: number | undefined;
	statusCodeMap: number[][] = [
		[100, 199],
		[200, 299],
		[300, 399],
		[400, 499],
		[500, 599]
	];

	message: string | undefined;
	messageMap: string[] = ['Information message', 'Success', 'Redirect', 'Client error', 'Server error'];

	ngOnInit(): void {
		/** Status response SEO correction */

		//! Works only in production build
		if (this.platformService.isServer()) {
			if (this.response) {
				this.response.status(Number(this.activatedRoute.snapshot.paramMap.get('status')));
			}
		}

		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
		this.setTitle();
	}

	setResolver(): void {
		const isCustom404: boolean = this.activatedRoute.snapshot.url[0].path === '404';

		// error/:status

		const statusCode: number = isCustom404 ? 404 : Number(this.activatedRoute.snapshot.paramMap.get('status'));
		const message: string = this.getMessageMap(statusCode);

		if (!statusCode || !message) {
			this.router.navigate(['/error', 500]).catch((error: any) => {
				this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error);
			});
		}

		this.statusCode = statusCode;
		this.message = message;
	}

	setTitle(): void {
		this.titleService.setTitle([this.statusCode, this.message].join(' '));
	}

	setMetaTags(): void {
		const title: string = this.message;

		// prettier-ignore
		const description: string = 'Oops! It seems like you have landed on an error page. But don’t worry — Takabase will help you get back on track. Try heading back to the homepage or using the menu to find what you are looking for. Takabase is here to assist you';

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
