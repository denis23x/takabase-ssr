/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';

@Component({
	selector: 'app-abstract-markdown-prose',
	template: ''
})
export abstract class AbstractMarkdownProseComponent implements OnInit, OnDestroy {
	/** https://unicorn-utterances.com/posts/angular-extend-class */

	activatedRouteParams$: Subscription | undefined;

	abstractProse: string | undefined;
	abstractProse$: Subscription | undefined;
	abstractProseSkeleton: boolean = false;

	constructor(
		public httpClient: HttpClient,
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public platformService: PlatformService
	) {}

	ngOnInit(): void {
		this.activatedRouteParams$ = this.activatedRoute.params
			.pipe(filter((params: Params) => !!params.details))
			.subscribe({
				next: () => {
					/** Apply Data */

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
		this.abstractProse = 'Lorem Ipsum';
		this.abstractProseSkeleton = true;
	}

	setResolver(): void {
		const details: string = String(this.activatedRoute.snapshot.paramMap.get('details') || '');

		if (this.platformService.isBrowser()) {
			this.abstractProse$?.unsubscribe();
			this.abstractProse$ = this.httpClient
				.get(this.getAbstractProseUrl(details), {
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
