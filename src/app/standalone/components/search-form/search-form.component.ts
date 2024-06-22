/** @format */

import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { InputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';
import { HelperService } from '../../../core/services/helper.service';

interface SearchForm {
	query: FormControl<string>;
}

@Component({
	standalone: true,
	selector: 'app-search-form, [appSearchForm]',
	imports: [FormsModule, ReactiveFormsModule, InputTrimWhitespaceDirective, SvgIconComponent, SvgLogoComponent],
	templateUrl: './search-form.component.html'
})
export class SearchFormComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);

	@Input()
	set appSearchFormDisabled(searchFormDisabled: boolean) {
		if (searchFormDisabled) {
			this.searchForm.disable();
		} else {
			this.searchForm.enable();
		}
	}

	activatedRouteQueryParams$: Subscription | undefined;

	searchForm: FormGroup = this.formBuilder.group<SearchForm>({
		query: this.formBuilder.nonNullable.control('', [Validators.minLength(2), Validators.maxLength(24)])
	});
	searchForm$: Subscription | undefined;

	ngOnInit(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe({
			next: (queryParams: Params) => {
				const value: any = {
					query: queryParams.query || ''
				};

				this.searchForm.setValue(value, { emitEvent: false });
				this.searchForm.markAllAsTouched();
			},
			error: (error: any) => console.error(error)
		});

		this.searchForm$?.unsubscribe();
		this.searchForm$ = this.searchForm.valueChanges
			.pipe(
				debounceTime(1000),
				filter(() => this.searchForm.valid)
			)
			.subscribe({
				next: (value: any) => {
					this.router
						.navigate([], {
							relativeTo: this.activatedRoute,
							queryParams: {
								query: value.query || null
							},
							replaceUrl: true
						})
						.catch((error: any) => {
							this.helperService.getNavigationError(this.router.lastSuccessfulNavigation, error);
						});
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$, this.searchForm$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onClearQuery(): void {
		this.router
			.navigate([], {
				relativeTo: this.activatedRoute,
				queryParams: {
					query: null
				},
				queryParamsHandling: 'merge',
				replaceUrl: true
			})
			.catch((error: any) => {
				this.helperService.getNavigationError(this.router.lastSuccessfulNavigation, error);
			});
	}
}
