/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { ApiService } from '../../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../../core/services/helper.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { tap } from 'rxjs/operators';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { FirebaseService } from '../../core/services/firebase.service';
import type { Auth } from 'firebase/auth';

interface Sync {
	id: number;
	name: string;
	description: string;
	endpointList: SyncEndpoint[];
}

interface SyncEndpoint {
	id: number;
	method: string;
	url: string;
	isLoading: boolean;
}

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
	selector: 'app-settings-sync',
	templateUrl: './sync.component.html'
})
export class SettingsSyncComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	syncList: Sync[] = [
		{
			id: 1,
			name: 'Algolia',
			description: 'Sync database with Algolia indices',
			endpointList: [
				{
					id: 1,
					method: 'GET',
					url: '/api/v1/algolia/category',
					isLoading: false
				},
				{
					id: 2,
					method: 'GET',
					url: '/api/v1/algolia/post',
					isLoading: false
				},
				{
					id: 3,
					method: 'GET',
					url: '/api/v1/algolia/user',
					isLoading: false
				}
			]
		},
		{
			id: 2,
			name: 'Insights',
			description: 'Seed and get Insights',
			endpointList: [
				{
					id: 1,
					method: 'POST',
					url: '/api/v1/insights',
					isLoading: false
				},
				{
					id: 2,
					method: 'GET',
					url: '/api/v1/insights',
					isLoading: false
				}
			]
		}
	];

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	onClickGetToken(): void {
		const auth: Auth = this.firebaseService.getAuth();

		auth.currentUser
			.getIdToken()
			.then((token: string) => this.helperService.getNavigatorClipboard(token))
			.catch((error: any) => console.error(error))
			.finally(() => this.snackbarService.success('Ok', 'Token was copied'));
	}

	onClickSync(syncEndpoint: SyncEndpoint): void {
		syncEndpoint.isLoading = true;

		switch (true) {
			case syncEndpoint.url.includes('/algolia'): {
				this.apiService
					.get(syncEndpoint.url, { addRecords: 'Use the API' })
					.pipe(tap(() => this.snackbarService.success('Sync', 'Algolia synced')))
					.subscribe({
						next: () => (syncEndpoint.isLoading = false),
						error: () => (syncEndpoint.isLoading = false)
					});

				break;
			}
			case syncEndpoint.url.includes('/insights'): {
				const insightsDto: any = {
					value: 2,
					unit: 'week'
				};

				// @ts-ignore
				this.apiService[syncEndpoint.method.toLowerCase()](syncEndpoint.url, insightsDto)
					.pipe(tap(() => this.snackbarService.success('Sync', 'Insights synced')))
					.subscribe({
						next: () => (syncEndpoint.isLoading = false),
						error: () => (syncEndpoint.isLoading = false)
					});

				break;
			}
			default: {
				throw new Error('Invalid endpoint specified: ' + syncEndpoint);
			}
		}
	}
}
