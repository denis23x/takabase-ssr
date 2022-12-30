/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';

@Component({
	selector: 'app-search-post-detail',
	templateUrl: './detail.component.html'
})
export class SearchPostDetailComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	post: Post | undefined;

	constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => (this.post = post),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onClose(): void {
		this.router
			.navigate(['..'], {
				relativeTo: this.activatedRoute,
				queryParamsHandling: 'preserve'
			})
			.then(() => console.debug('Route changed'));
	}
}
