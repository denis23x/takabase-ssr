/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data } from '@angular/router';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';

@Component({
	standalone: true,
	imports: [MarkdownPipe, SanitizerPipe],
	selector: 'app-help-details',
	templateUrl: './details.component.html'
})
export class HelpDetailsComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	prose: string | undefined;

	constructor(private activatedRoute: ActivatedRoute) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (prose: string) => (this.prose = prose),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}
}
