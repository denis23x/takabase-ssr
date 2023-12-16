/** @format */

import { Component, inject, Input, numberAttribute, OnDestroy, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CookieService } from '../core/services/cookie.service';
import { AppearanceService } from '../core/services/appearance.service';
import { AbstractGetAllDto } from '../core/dto/abstract/abstract-get-all.dto';

@Component({
	selector: 'app-abstract-search-list',
	template: ''
})
export abstract class AbstractSearchListComponent implements OnInit, OnDestroy {
	cookieService: CookieService = inject(CookieService);
	appearanceService: AppearanceService = inject(AppearanceService);

	/* --- */

	@Input({ transform: numberAttribute })
	set categoryId(categoryId: number | undefined) {
		this.setAbstractListGetAllDto({
			categoryId
		});
	}

	@Input()
	set userName(userName: string | undefined) {
		this.setAbstractListGetAllDto({
			userName: userName ? userName.substring(1) : userName
		});
	}

	@Input()
	set query(query: string | undefined) {
		this.setAbstractListGetAllDto({
			query
		});
	}

	@Input()
	set orderBy(orderBy: string | undefined) {
		this.setAbstractListGetAllDto({
			orderBy
		});
	}

	/** https://unicorn-utterances.com/posts/angular-extend-class */

	abstractListPageDefault: number = 1;
	abstractListSizeDefault: number = 20;

	// prettier-ignore
	abstractListGetAllDto$: BehaviorSubject<AbstractGetAllDto> = new BehaviorSubject<AbstractGetAllDto>({});

	abstractListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	abstractListIsHasMore: boolean = false;

	abstractListPageScrollInfinite: boolean = false;
	abstractListPageScrollInfinite$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply appearance settings */

		this.setAbstractAppearance();
	}

	ngOnDestroy(): void {
		[this.abstractListPageScrollInfinite$].forEach(($: Subscription) => $?.unsubscribe());

		// prettier-ignore
		[this.abstractListIsLoading$, this.abstractListGetAllDto$].forEach(($: BehaviorSubject<any>) => $?.complete());
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

	setAbstractListGetAllDto(getAllDtoParams: Partial<AbstractGetAllDto>): void {
		const getAllDto: AbstractGetAllDto = this.abstractListGetAllDto$.getValue();

		this.abstractListGetAllDto$.next({
			...getAllDto,
			...getAllDtoParams,
			page: this.abstractListPageDefault,
			size: this.abstractListSizeDefault
		});
	}

	getAbstractListGetAllDto(): AbstractGetAllDto {
		const getAllDto: any = this.abstractListGetAllDto$.getValue();
		const getAllDtoEntries: any[] = Object.entries(getAllDto);
		const getAllDtoFiltered: any[] = getAllDtoEntries.filter(([, value]: [string, any]) => !!value);

		return Object.fromEntries(getAllDtoFiltered);
	}

	abstract getAbstractList(): void;

	abstract getAbstractListLoadMore(): void;
}
