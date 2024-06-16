/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';
import { Subscription } from 'rxjs';
import { AbstractSearchComponent } from '../abstracts/abstract-search.component';
import { SvgLogoComponent } from '../standalone/components/svg-logo/svg-logo.component';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, SearchFormComponent, SvgLogoComponent],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent implements OnDestroy {
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	abstractListIsLoading$: Subscription | undefined;
	abstractListIsLoading: boolean = false;

	ngOnDestroy(): void {
		[this.abstractListIsLoading$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onRouterOutlet(abstractListComponent: AbstractSearchComponent | undefined): void {
		this.abstractListIsLoading$?.unsubscribe();
		this.abstractListIsLoading$ = abstractListComponent.abstractListIsLoading$.subscribe({
			next: (abstractListIsLoading: boolean) => {
				this.abstractListIsLoading = abstractListIsLoading;

				// ExpressionChangedAfterItHasBeenCheckedError (abstractListComponent)

				this.changeDetectorRef.detectChanges();
			},
			error: (error: any) => console.error(error)
		});
	}
}
