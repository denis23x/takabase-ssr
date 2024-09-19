/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { nanoid } from 'nanoid';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PlatformService } from '../services/platform.service';
import { from, Subscription, throwError } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

export function MarkdownMixin<T extends new (...args: any[]) => any>(MasterClass: T) {
	@Component({
		selector: 'app-markdown-mixin',
		template: '',
		host: {
			hostID: nanoid()
		}
	})
	abstract class SlaveClass extends MasterClass implements OnInit, OnDestroy {
		public readonly httpClient: HttpClient = inject(HttpClient);
		public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
		public readonly router: Router = inject(Router);
		public readonly platformService: PlatformService = inject(PlatformService);

		activatedRouteParams$: Subscription | undefined;

		markdownProse: string | undefined;
		markdownProse$: Subscription | undefined;
		markdownProseSkeleton: boolean = false;

		ngOnInit(): void {
			super.ngOnInit && super.ngOnInit();

			/** Apply Data */

			this.activatedRouteParams$ = this.activatedRoute.params
				.pipe(filter((params: Params) => !!params.details))
				.subscribe({
					next: () => {
						this.setSkeleton();
						this.setResolver();
					},
					error: (error: any) => console.error(error)
				});
		}

		ngOnDestroy(): void {
			super.ngOnDestroy && super.ngOnDestroy();

			// ngOnDestroy

			[this.activatedRouteParams$, this.markdownProse$].forEach(($: Subscription) => $?.unsubscribe());
		}

		setSkeleton(): void {
			this.markdownProse = 'Lorem Ipsum';
			this.markdownProseSkeleton = true;
		}

		setResolver(): void {
			const details: string = String(this.activatedRoute.snapshot.paramMap.get('details') || '');

			this.markdownProse$?.unsubscribe();
			this.markdownProse$ = this.httpClient
				.get(this.getMarkdownProseUrl(details), {
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
						return from(this.router.navigate(['/error', httpErrorResponse.status], { skipLocationChange: true })).pipe(
							switchMap(() => throwError(() => httpErrorResponse))
						);
					})
				)
				.subscribe({
					next: (prose: string) => {
						this.markdownProse = prose;
						this.markdownProseSkeleton = false;
					},
					error: (error: any) => console.error(error)
				});
		}

		abstract getMarkdownProseUrl(markdown: string): string;
	}

	return SlaveClass;
}
