/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { SkeletonService } from '../core/services/skeleton.service';
import { PlatformService } from '../core/services/platform.service';

@Component({
	selector: 'app-abstract-markdown-prose',
	template: ''
})
export abstract class AbstractMarkdownProseComponent implements OnInit, OnDestroy {
	activatedRouteParams$: Subscription | undefined;

	abstractProse: string | undefined;
	abstractProse$: Subscription | undefined;
	abstractProseSkeleton: boolean = false;

	constructor(
		private httpClient: HttpClient,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private skeletonService: SkeletonService,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		/** Apply Data */

		this.activatedRouteParams$ = this.activatedRoute.params
			.pipe(filter((params: Params) => !!params.markdown))
			.subscribe({
				next: () => {
					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteParams$, this.abstractProse$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.abstractProse = this.skeletonService.getLoremIpsum();
		this.abstractProseSkeleton = true;
	}

	setResolver(): void {
		const markdown: string = String(this.activatedRoute.snapshot.paramMap.get('markdown') || '');

		if (this.platformService.isBrowser()) {
			this.abstractProse$?.unsubscribe();
			this.abstractProse$ = this.httpClient
				.get(this.getAbstractProseUrl(markdown), {
					responseType: 'text'
				})
				.pipe(
					catchError((httpErrorResponse: HttpErrorResponse) => {
						this.router
							.navigate(['/error', httpErrorResponse.status])
							.then(() => console.debug('Route changed'));

						return throwError(() => httpErrorResponse);
					})
				)
				.subscribe({
					next: (prose: string) => {
						this.abstractProse = prose;
						this.abstractProseSkeleton = false;
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	abstract getAbstractProseUrl(markdown: string): string;
}
