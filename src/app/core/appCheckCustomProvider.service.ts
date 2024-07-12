/** @format */

import { inject, Injectable } from '@angular/core';
import { CustomProvider, AppCheckToken } from 'firebase/app-check';
import { ApiService } from './services/api.service';
import { environment } from '../../environments/environment';
import { AppCheckDto } from './dto/authorization/app-check.dto';

@Injectable({
	providedIn: 'root'
})
export class AppCheckCustomProvider {
	private readonly apiService: ApiService = inject(ApiService);

	getProvider(): CustomProvider {
		return new CustomProvider({
			getToken: () => {
				return new Promise((resolve, reject) => {
					const appCheckDto: AppCheckDto = {
						appId: environment.firebase.appId
					};

					this.apiService.post('/v1/authorization/app-check', appCheckDto).subscribe({
						next: (appCheckToken: AppCheckToken) => {
							resolve({
								...appCheckToken,
								expireTimeMillis: appCheckToken.expireTimeMillis * 1000
							});
						},
						error: (error: any) => console.error(error)
					});
				});
			}
		});
	}
}
