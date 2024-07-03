/** @format */

import { Component, inject, Input, OnDestroy, OnInit, TransferState } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CookiesService } from '../core/services/cookies.service';
import { AppearanceService } from '../core/services/appearance.service';
import { AbstractGetAllDto } from '../core/dto/abstract/abstract-get-all.dto';
import { AuthorizationService } from '../core/services/authorization.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonService } from '../core/services/skeleton.service';
import { AlgoliaService } from '../core/services/algolia.service';
import { MetaService } from '../core/services/meta.service';
import { PlatformService } from '../core/services/platform.service';

@Component({
	selector: 'app-abstract-search',
	template: ''
})
export abstract class AbstractSearchComponent implements OnInit, OnDestroy {
	public readonly router: Router = inject(Router);
	public readonly cookiesService: CookiesService = inject(CookiesService);
	public readonly appearanceService: AppearanceService = inject(AppearanceService);
	public readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly skeletonService: SkeletonService = inject(SkeletonService);
	public readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	public readonly metaService: MetaService = inject(MetaService);
	public readonly platformService: PlatformService = inject(PlatformService);
	public readonly transferState: TransferState = inject(TransferState);

	@Input()
	set query(query: string | undefined) {
		this.setAbstractGetAllDto({
			query
		});
	}

	/** https://unicorn-utterances.com/posts/angular-extend-class */

	abstractGetAllDto$: BehaviorSubject<AbstractGetAllDto> = new BehaviorSubject<AbstractGetAllDto>({
		page: 1,
		size: 20
	});

	abstractGetAllDtoPageDefault: number = 1;
	abstractGetAllDtoSizeDefault: number = 20;

	abstractListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	abstractListIsHasMore: boolean = false;

	abstractListPageScrollInfinite: boolean = false;
	abstractListPageScrollInfinite$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply abstract appearance settings */

		this.abstractListPageScrollInfinite = !!Number(this.cookiesService.getItem('page-scroll-infinite'));

		if (this.abstractListPageScrollInfinite) {
			this.abstractListPageScrollInfinite$?.unsubscribe();
			this.abstractListPageScrollInfinite$ = this.appearanceService
				.getPageScrollInfinite()
				.pipe(filter(() => this.abstractListIsHasMore && !this.abstractListIsLoading$.getValue()))
				.subscribe({
					next: () => this.getAbstractList(true),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[this.abstractListPageScrollInfinite$].forEach(($: Subscription) => $?.unsubscribe());

		[this.abstractListIsLoading$, this.abstractGetAllDto$].forEach(($: BehaviorSubject<any>) => $?.complete());
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

		return Object.fromEntries(getAllDtoFiltered) as AbstractGetAllDto;
	}

	abstract getAbstractList(abstractListLoadMore: boolean): void;
}
