/** @format */

import { Component, inject, Input, numberAttribute, OnDestroy, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CookieService } from '../core/services/cookie.service';
import { AppearanceService } from '../core/services/appearance.service';
import { AbstractGetAllDto } from '../core/dto/abstract/abstract-get-all.dto';
import { CurrentUser } from '../core/models/current-user.model';
import { AuthorizationService } from '../core/services/authorization.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SkeletonService } from '../core/services/skeleton.service';

@Component({
	selector: 'app-abstract-search',
	template: ''
})
export abstract class AbstractSearchComponent implements OnInit, OnDestroy {
	public readonly router: Router = inject(Router);
	public readonly cookieService: CookieService = inject(CookieService);
	public readonly appearanceService: AppearanceService = inject(AppearanceService);
	public readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly skeletonService: SkeletonService = inject(SkeletonService);

	@Input({ transform: numberAttribute })
	set categoryId(categoryId: number | undefined) {
		this.setAbstractGetAllDto({
			categoryId
		});
	}

	@Input()
	set userName(userName: string | undefined) {
		this.setAbstractGetAllDto({
			userName: userName ? userName.substring(1) : userName
		});
	}

	@Input()
	set query(query: string | undefined) {
		this.setAbstractGetAllDto({
			query
		});
	}

	@Input()
	set orderBy(orderBy: string | undefined) {
		this.setAbstractGetAllDto({
			orderBy
		});
	}

	@Input()
	set status(status: string | undefined) {
		if (status) {
			const queryParams: Params = {
				...this.activatedRoute.snapshot.queryParams,
				status: null
			};

			this.router
				.navigate([], {
					queryParams,
					queryParamsHandling: 'merge',
					relativeTo: this.activatedRoute,
					replaceUrl: true
				})
				.then(() => this.setAbstractGetAllDto(this.getAbstractGetAllDto()));
		}
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	/** https://unicorn-utterances.com/posts/angular-extend-class */

	// prettier-ignore
	abstractGetAllDto$: BehaviorSubject<AbstractGetAllDto> = new BehaviorSubject<AbstractGetAllDto>({});
	abstractGetAllDtoPageDefault: number = 1;
	abstractGetAllDtoSizeDefault: number = 20;

	abstractListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	abstractListIsHasMore: boolean = false;

	abstractListPageScrollInfinite: boolean = false;
	abstractListPageScrollInfinite$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply appearance settings */

		this.setAbstractAppearance();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.abstractListPageScrollInfinite$].forEach(($: Subscription) => $?.unsubscribe());

		// prettier-ignore
		[this.abstractListIsLoading$, this.abstractGetAllDto$].forEach(($: BehaviorSubject<any>) => $?.complete());
	}

	setAbstractAppearance(): void {
		// prettier-ignore
		this.abstractListPageScrollInfinite = !!Number(this.cookieService.getItem('page-scroll-infinite'));

		if (this.abstractListPageScrollInfinite) {
			this.abstractListPageScrollInfinite$?.unsubscribe();
			this.abstractListPageScrollInfinite$ = this.appearanceService
				.setPageScrollInfinite()
				.pipe(filter(() => this.abstractListIsHasMore && !this.abstractListIsLoading$.getValue()))
				.subscribe({
					next: () => this.getAbstractListLoadMore(),
					error: (error: any) => console.error(error)
				});
		}
	}

	setAbstractGetAllDto(getAllDtoParams: Partial<AbstractGetAllDto>): void {
		const getAllDto: AbstractGetAllDto = this.abstractGetAllDto$.getValue();

		this.abstractGetAllDto$.next({
			...getAllDto,
			...getAllDtoParams,
			page: this.abstractGetAllDtoPageDefault,
			size: this.abstractGetAllDtoSizeDefault
		});
	}

	getAbstractGetAllDto(): AbstractGetAllDto {
		const getAllDto: any = this.abstractGetAllDto$.getValue();
		const getAllDtoEntries: any[] = Object.entries(getAllDto);
		const getAllDtoFiltered: any[] = getAllDtoEntries.filter(([, value]: [string, any]) => !!value);

		return Object.fromEntries(getAllDtoFiltered);
	}

	abstract getAbstractList(): void;

	abstract getAbstractListLoadMore(): void;
}
