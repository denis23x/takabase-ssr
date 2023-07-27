/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';

interface SearchForm {
	query: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
		AppInputTrimWhitespaceDirective,
		SvgIconComponent,
		AppScrollIntoViewDirective
	],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
	routeQueryParams$: Subscription | undefined;

	searchForm: FormGroup | undefined;
	searchForm$: Subscription | undefined;
	searchFormIsSubmitted$: Subscription | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder
	) {
		this.searchForm = this.formBuilder.group<SearchForm>({
			query: this.formBuilder.nonNullable.control('', [
				Validators.minLength(4),
				Validators.maxLength(16)
			])
		});
	}

	ngOnInit(): void {
		this.routeQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				map((params: Params) => params.query),
				filter((query: string) => !!query)
			)
			.subscribe({
				next: (query: string) => {
					// prettier-ignore
					const abstractControl: AbstractControl = this.searchForm.get('query');

					abstractControl.setValue(query, { emitEvent: false });
					abstractControl.markAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.searchForm$ = this.searchForm.valueChanges
			.pipe(
				debounceTime(400),
				filter(() => this.searchForm.valid)
			)
			.subscribe({
				next: () => {
					const value: any = this.searchForm.value;

					this.router
						.navigate([], {
							relativeTo: this.activatedRoute,
							queryParams: {
								query: value.query || null
							},
							queryParamsHandling: 'merge'
						})
						.then(() => console.debug('Route changed'));
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[
			this.routeQueryParams$,
			this.searchForm$,
			this.searchFormIsSubmitted$
		].forEach($ => $?.unsubscribe());
	}

	onRouterOutletActivate(event: any): void {
		const isLoading$: Observable<boolean> = event.abstractListLoading$;

		// prettier-ignore
		this.searchFormIsSubmitted$ = isLoading$.subscribe({
      next: (isSubmitted: boolean) => isSubmitted ? this.searchForm.disable() : this.searchForm.enable(),
      error: (error: any) => console.error(error)
    });
	}
}
