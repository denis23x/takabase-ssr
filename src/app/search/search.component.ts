/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';

interface SearchForm {
	query: FormControl<string>;
	orderBy: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
		AppInputTrimWhitespaceDirective,
		SvgIconComponent,
		DropdownComponent,
		AppScrollIntoViewDirective
	],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
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
				Validators.minLength(4),
				Validators.maxLength(16)
			]),
			orderBy: this.formBuilder.nonNullable.control('', [])
		});
	}

	ngOnInit(): void {
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(filter((params: Params) => params.query || params.orderBy))
			.subscribe({
				next: (params: Params) => {
					this.searchForm.patchValue(params, { emitEvent: false });
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
		[
			this.activatedRouteQueryParams$,
			this.searchForm$,
			this.searchFormIsSubmitted$
		].forEach(($: Subscription) => $?.unsubscribe());
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
