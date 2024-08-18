/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { nanoid } from 'nanoid';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../services/helper.service';

export function SearchPostsMixin<T extends new (...args: any[]) => any>(MasterClass: T) {
	@Component({
		selector: 'app-search-posts-mixin',
		template: '',
		host: {
			hostID: nanoid()
		}
	})
	abstract class SlaveClass extends MasterClass implements OnInit, OnDestroy {
		public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
		public readonly router: Router = inject(Router);
		public readonly helperService: HelperService = inject(HelperService);

		searchFormToggle: boolean = false;
		searchResponse: any;

		ngOnInit(): void {
			super.ngOnInit && super.ngOnInit();

			// ngOnInit

			/** Toggle SearchForm component */

			if (this.activatedRoute.snapshot.queryParamMap.get('query')) {
				this.onToggleSearchForm(true);
			} else {
				this.onToggleSearchForm(false);
			}
		}

		ngOnDestroy(): void {
			super.ngOnDestroy && super.ngOnDestroy();

			// ngOnDestroy
		}

		onToggleSearchForm(toggle: boolean): void {
			if (toggle) {
				this.searchFormToggle = true;
			} else {
				this.searchFormToggle = false;

				this.router
					.navigate([], {
						relativeTo: this.activatedRoute,
						queryParams: null,
						replaceUrl: true
					})
					.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
			}
		}
	}

	return SlaveClass;
}
