/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { nanoid } from 'nanoid';
import { distinctUntilChanged, fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';
import type { Post } from '../models/post.model';

export function MasonryPostsMixin<T extends new (...args: any[]) => any>(MasterClass: T) {
	@Component({
		selector: 'app-masonry-posts-mixin',
		template: '',
		host: {
			hostID: nanoid()
		}
	})
	abstract class SlaveClass extends MasterClass implements OnInit, OnDestroy {
		public readonly platformService: PlatformService = inject(PlatformService);

		resize$: Subscription | undefined;

		masonryColumns: Post[][] = [];
		masonryColumnsWeights: number[] = [];

		ngOnInit(): void {
			super.ngOnInit && super.ngOnInit();

			// ngOnInit

			/** Masonry re-render */

			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				this.resize$?.unsubscribe();
				this.resize$ = fromEvent(window, 'resize')
					.pipe(
						map(() => this.platformService.getBreakpoint()),
						distinctUntilChanged()
					)
					.subscribe({
						next: () => this.setMasonry(),
						error: (error: any) => console.error(error)
					});
			}
		}

		ngOnDestroy(): void {
			super.ngOnDestroy && super.ngOnDestroy();

			// ngOnDestroy

			[this.resize$].forEach(($: Subscription) => $?.unsubscribe());
		}

		setMasonry(): void {
			const breakpoint: string = this.platformService.getBreakpoint();
			const breakpointMap: Record<string, number> = {
				xs: 2,
				sm: 3,
				md: 4
			};

			const breakpointColumns: number = breakpointMap[breakpoint] || Math.max(...Object.values(breakpointMap));
			const breakpointColumnsArray: null[] = Array(breakpointColumns).fill(null);

			this.masonryColumns = [...breakpointColumnsArray.map(() => [])];
			this.masonryColumnsWeights = breakpointColumnsArray.map(() => 0);

			// Draw Masonry

			const postList: Post[] = this.postList || this.postBookmarkList || this.postPasswordList || this.postPrivateList;

			postList.forEach((post: Post) => {
				const index: number = this.masonryColumnsWeights.indexOf(Math.min(...this.masonryColumnsWeights));

				this.masonryColumns[index].push(post);
				this.masonryColumnsWeights[index] += post.image ? 2.5 : 1;
			});
		}
	}

	return SlaveClass;
}
