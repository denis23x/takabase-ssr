/** @format */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { ApiService } from '../../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HelperService } from '../../core/services/helper.service';

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
export class SettingsSyncComponent {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly helperService: HelperService = inject(HelperService);

	syncList: Sync[] = [
		{
			id: 1,
			name: 'Algolia',
			description: 'Sync database with Algolia indices',
			endpointList: [
				{
					id: 1,
					method: 'GET',
					url: '/v1/algolia/category',
					isLoading: false
				},
				{
					id: 2,
					method: 'GET',
					url: '/v1/algolia/post',
					isLoading: false
				},
				{
					id: 3,
					method: 'GET',
					url: '/v1/algolia/user',
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
					url: '/v1/insights',
					isLoading: false
				},
				{
					id: 2,
					method: 'GET',
					url: '/v1/insights',
					isLoading: false
				}
			]
		},
		{
			id: 3,
			name: 'Sitemap',
			description: 'Download sitemaps',
			endpointList: [
				{
					id: 1,
					method: 'GET',
					url: '/v1/sitemap/category',
					isLoading: false
				},
				{
					id: 2,
					method: 'GET',
					url: '/v1/sitemap/post',
					isLoading: false
				},
				{
					id: 3,
					method: 'GET',
					url: '/v1/sitemap/user',
					isLoading: false
				}
			]
		}
	];

	onClickSync(syncEndpoint: SyncEndpoint): void {
		syncEndpoint.isLoading = true;

		switch (true) {
			case syncEndpoint.url.includes('/algolia'): {
				this.apiService.get(syncEndpoint.url, { addRecords: 'Use the API' }).subscribe({
					next: (data: any) => console.debug(data),
					error: (error: any) => console.error(error),
					complete: () => (syncEndpoint.isLoading = false)
				});

				break;
			}
			case syncEndpoint.url.includes('/insights'): {
				const insightsDto: any = {
					value: 2,
					unit: 'week'
				};

				// @ts-ignore
				this.apiService[syncEndpoint.method.toLowerCase()](syncEndpoint.url, insightsDto).subscribe({
					next: (data: any) => console.debug(data),
					error: (error: any) => console.error(error),
					complete: () => (syncEndpoint.isLoading = false)
				});

				break;
			}
			case syncEndpoint.url.includes('/sitemap'): {
				// prettier-ignore
				this.httpClient
					.get(environment.apiUrl + syncEndpoint.url, { responseType: 'blob' })
					.subscribe({
						next: (blob: Blob) => {
							const file: File = this.helperService.getFileFromBlob(blob);
							const fileReader: FileReader = new FileReader();
							const fileName: string = syncEndpoint.url.split('/').pop() + '.xml';

							fileReader.addEventListener('load', () => this.helperService.setDownload(fileReader.result as string, fileName));
							fileReader.readAsDataURL(file);
						},
						error: (error: any) => console.error(error),
						complete: () => syncEndpoint.isLoading = false,
					});

				break;
			}
			default: {
				throw new Error('Invalid endpoint specified: ' + syncEndpoint);
			}
		}
	}
}
