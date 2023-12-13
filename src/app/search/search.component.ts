/** @format */

import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollPresetDirective, SearchFormComponent],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent {
	constructor(private changeDetectorRef: ChangeDetectorRef) {}

	onRouterOutletActivate(component: any): void {
		// TODO: update
		// // ExpressionChangedAfterItHasBeenCheckedError (searchForm)
		//
		// this.changeDetectorRef.detectChanges();
		//
		// // Control searchForm state from children
		//
		// const isLoading$: Observable<boolean> = component.abstractListIsLoading$;
		//
		// this.searchFormIsSubmitted$?.unsubscribe();
		// this.searchFormIsSubmitted$ = isLoading$.pipe(skip(1)).subscribe({
		// 	next: (isSubmitted: boolean) => {
		// 		isSubmitted ? this.searchForm.disable() : this.searchForm.enable();
		// 	},
		// 	error: (error: any) => console.error(error)
		// });
	}
}
