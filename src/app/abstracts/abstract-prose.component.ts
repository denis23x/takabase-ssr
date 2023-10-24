/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';

@Component({
	selector: 'app-abstract-prose',
	template: ''
})
export abstract class AbstractProseComponent implements OnInit, OnDestroy {
	activatedRouteParams$: Subscription | undefined;

	abstractProse: string | undefined;

	constructor(
		private httpClient: HttpClient,
		private activatedRoute: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit(): void {
		this.activatedRouteParams$ = this.activatedRoute.params
			.pipe(
				map((params: Params) => params.markdown),
				filter((markdown: string | undefined) => !!markdown),
				switchMap((markdown: string) => {
					return this.httpClient.get(this.getAbstractProseUrl(markdown), {
						responseType: 'text'
					});
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router.navigate(['/error', httpErrorResponse.status]).then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			)
			.subscribe({
				next: (prose: string) => (this.abstractProse = prose),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteParams$].forEach(($: Subscription) => $?.unsubscribe());
	}

	abstract getAbstractProseUrl(markdown: string): string;
}
