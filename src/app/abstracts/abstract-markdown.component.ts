/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, map } from 'rxjs/operators';
import { Subscription, throwError } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';

@Component({
	selector: 'app-abstract-markdown',
	template: ''
})
export abstract class AbstractMarkdownComponent implements OnInit, OnDestroy {
	public readonly httpClient: HttpClient = inject(HttpClient);
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly router: Router = inject(Router);
	public readonly platformService: PlatformService = inject(PlatformService);

	/** https://unicorn-utterances.com/posts/angular-extend-class */

	activatedRouteParams$: Subscription | undefined;

	abstractProse: string | undefined;
	abstractProse$: Subscription | undefined;
	abstractProseSkeleton: boolean = false;

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
		[this.activatedRouteParams$, this.abstractProse$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.abstractProse = 'Lorem Ipsum';
		this.abstractProseSkeleton = true;
	}

	setResolver(): void {
		const details: string = String(this.activatedRoute.snapshot.paramMap.get('details') || '');

		this.abstractProse$?.unsubscribe();
		this.abstractProse$ = this.httpClient
			.get(this.getAbstractProseUrl(details), {
				responseType: 'text'
			})
			.pipe(
				map((prose: string) => {
					const modifierKey: string = this.platformService.getOSModifierKey();
					const keyboardCharacter: string = this.platformService.getOSKeyboardCharacter(modifierKey);
					const proseUpdated: string = prose.replaceAll('modifierKey', keyboardCharacter);

					return proseUpdated;
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router.navigate(['/error', httpErrorResponse.status]).then(() => console.debug('Route changed'));

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

	abstract getAbstractProseUrl(markdown: string): string;
}
