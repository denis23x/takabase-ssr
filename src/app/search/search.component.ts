/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { debounceTime, filter, skip } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';

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
		AppScrollPresetDirective
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
		private formBuilder: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef
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
		this.searchForm$ = this.searchForm.valueChanges
			.pipe(
				debounceTime(1000),
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
		// prettier-ignore
		[this.activatedRouteQueryParams$, this.searchForm$, this.searchFormIsSubmitted$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onRouterOutletActivate(component: any): void {
		// ExpressionChangedAfterItHasBeenCheckedError (searchForm)

		this.changeDetectorRef.detectChanges();

		// Control searchForm state from children

		const isLoading$: Observable<boolean> = component.abstractListIsLoading$;

		this.searchFormIsSubmitted$?.unsubscribe();
		this.searchFormIsSubmitted$ = isLoading$.pipe(skip(1)).subscribe({
			next: (isSubmitted: boolean) => {
				isSubmitted ? this.searchForm.disable() : this.searchForm.enable();
			},
			error: (error: any) => console.error(error)
		});
	}
}
