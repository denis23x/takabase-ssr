/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { DropdownComponent } from '../dropdown/dropdown.component';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

interface SearchForm {
	query: FormControl<string>;
	orderBy: FormControl<string>;
}

@Component({
	standalone: true,
	selector: 'app-search-form, [appSearchForm]',
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		AppInputTrimWhitespaceDirective,
		DropdownComponent,
		SvgIconComponent
	],
	templateUrl: './search-form.component.html'
})
export class SearchFormComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	searchForm: FormGroup | undefined;
	searchForm$: Subscription | undefined;
	searchFormIsSubmitted$: Subscription | undefined;
	searchFormOrderByList: string[] = ['newest', 'oldest'];

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder
	) {
		this.searchForm = this.formBuilder.group<SearchForm>({
			query: this.formBuilder.nonNullable.control('', [
				Validators.minLength(2),
				Validators.maxLength(24)
			]),
			orderBy: this.formBuilder.nonNullable.control('', [])
		});
	}

	ngOnInit(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(filter((params: Params) => params.query || params.orderBy))
			.subscribe({
				next: (params: Params) => {
					this.searchForm.patchValue(params, { emitEvent: false });
					this.searchForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.searchForm$?.unsubscribe();
		this.searchForm$ = merge(
			this.searchForm.get('query').valueChanges.pipe(debounceTime(1000)),
			this.searchForm.get('orderBy').valueChanges
		)
			.pipe(filter(() => this.searchForm.valid))
			.subscribe({
				next: () => {
					const value: any = this.searchForm.value;

					this.router
						.navigate([], {
							relativeTo: this.activatedRoute,
							queryParams: {
								query: value.query || null,
								orderBy: value.orderBy || null
							},
							queryParamsHandling: 'merge'
						})
						.then(() => console.debug('Route changed'));
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteQueryParams$, this.searchForm$, this.searchFormIsSubmitted$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
