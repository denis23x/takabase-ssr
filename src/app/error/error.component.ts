/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SvgIconComponent } from '../shared/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

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

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private metaService: MetaService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.params
			.pipe(map((data: Data) => data.status))
			.subscribe({
				next: (status: string) => {
					const statusCode: number = Number(status);
					const message: string = this.getMessageMap(statusCode);

					if (!statusCode || !message) {
						this.router
							.navigate([[], 520])
							.then(() => console.debug('Route changed'));
					}

					this.statusCode = statusCode;
					this.message = message;

					this.setMeta();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const title: string = this.message;

		// prettier-ignore
		const description: string = 'Oops! It looks like you\'ve landed on an error page on Draft';

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
		const index: number = this.statusCodeMap.findIndex(
			([min, max]: number[]) => {
				return min <= status === status < max;
			}
		);

		return this.messageMap[index];
	}
}
