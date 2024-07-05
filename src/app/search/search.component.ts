/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';
import { Observable, Subscription } from 'rxjs';
import { SvgLogoComponent } from '../standalone/components/svg-logo/svg-logo.component';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, SearchFormComponent, SvgLogoComponent],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent implements OnDestroy {
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	searchListIsLoading: boolean = false;
	searchListIsLoading$: Subscription | undefined;

	ngOnDestroy(): void {
		[this.searchListIsLoading$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onRouterOutlet(searchListComponent: any | undefined): void {
		if (searchListComponent) {
			const searchListIsLoading$ = (): Observable<boolean> => {
				const searchListIsLoadingList: (Observable<boolean> | undefined)[] = [
					searchListComponent.postListIsLoading$,
					searchListComponent.categoryListIsLoading$,
					searchListComponent.userListIsLoading$
				];

				// prettier-ignore
				return searchListIsLoadingList.find((searchListIsLoading: Observable<boolean> | undefined) => !!searchListIsLoading);
			};

			/** Catch searchListIsLoading$ */

			this.searchListIsLoading$?.unsubscribe();
			this.searchListIsLoading$ = searchListIsLoading$().subscribe({
				next: (searchListIsLoading: boolean) => {
					this.searchListIsLoading = searchListIsLoading;

					// ExpressionChangedAfterItHasBeenCheckedError (abstractListComponent)

					this.changeDetectorRef.detectChanges();
				},
				error: (error: any) => console.error(error)
			});
		}
	}
}
