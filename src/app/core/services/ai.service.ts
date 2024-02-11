/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AIModerateTextDto, AIModerateTextResult } from '../dto/ai/ai-moderate-text.dto';
import { AIModerateImageResult } from '../dto/ai/ai-moderate-image.dto';

@Injectable({
	providedIn: 'root'
})
export class AIService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);

	setUrl(url: string): string {
		return environment.ai.url + url;
	}

	moderateTextPredict(aiModerateTextResult: AIModerateTextResult): boolean {
		return Object.values(aiModerateTextResult.categories).every((probability: boolean) => {
			return probability === false;
		});
	}

	moderateImagePredict(aiModerateImageResultList: AIModerateImageResult[]): boolean {
		const nsfwCategoryList: string[] = ['Porn', 'Sexy', 'Hentai'];

		/** https://github.com/infinitered/nsfwjs */

		// prettier-ignore
		const nsfwCategoryListResult: AIModerateImageResult[] = aiModerateImageResultList.filter((aiModerateImage: AIModerateImageResult) => {
      return nsfwCategoryList.includes(aiModerateImage.className)
    });

		// prettier-ignore
		const nsfwProbability: number = nsfwCategoryListResult.reduce((accumulator: number, aiModerateImage: AIModerateImageResult) => accumulator + aiModerateImage.probability, 0);
		const nsfwProbabilityMax: number = 0.5;

		return nsfwProbability < nsfwProbabilityMax;
	}

	/** AI function */

	moderateText(aiModerateTextDto: AIModerateTextDto): Observable<AIModerateTextResult> {
		return this.httpClient.post(this.setUrl('/moderation/text'), aiModerateTextDto).pipe(
			map((response: any) => response.data || response),
			map((response: any) => response.results.shift()),
			switchMap((response: any) => {
				if (this.moderateTextPredict(response)) {
					return of(response);
				} else {
					return throwError(() => {
						return new HttpErrorResponse({
							error: {
								message: 'The text contains prohibited content'
							}
						});
					});
				}
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	moderateImage(formData: FormData): Observable<AIModerateImageResult[]> {
		return this.httpClient.post(this.setUrl('/moderation/image'), formData).pipe(
			map((response: any) => response.data || response),
			switchMap((response: any) => {
				if (this.moderateImagePredict(response)) {
					return of(response);
				} else {
					return throwError(() => {
						return new HttpErrorResponse({
							error: {
								message: 'Uploaded image contains prohibited content'
							}
						});
					});
				}
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}
}
