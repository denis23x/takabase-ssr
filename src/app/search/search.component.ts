/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

interface SearchForm {
	query: FormControl<string>;
}

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
	routeQueryParams$: Subscription | undefined;

	searchForm: FormGroup | undefined;
	searchForm$: Subscription | undefined;
	searchFormIsSubmitted: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder
	) {
		this.searchForm = this.formBuilder.group<SearchForm>({
			query: this.formBuilder.control('', [
				Validators.minLength(4),
				Validators.maxLength(24)
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
					this.searchForm.setValue({ query }, { emitEvent: false });
					this.searchForm.markAllAsTouched();
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
					let value: any = this.searchForm.value;

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
		[this.routeQueryParams$, this.searchForm$].forEach($ => $?.unsubscribe());
	}

	onRouterOutletActivate(event: any): void {
		// prettier-ignore
		const isLoading: Observable<boolean> = event.categoryListLoading || event.postListLoading || event.userListLoading

		isLoading.subscribe((isSubmitted: boolean) => {
			this.searchFormIsSubmitted = isSubmitted;
		});
	}
}
