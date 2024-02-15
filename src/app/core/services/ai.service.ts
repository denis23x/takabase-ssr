/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
	AIModerateTextDto,
	AIModerateTextResult,
	AIModerateTextResultItem
} from '../dto/ai/ai-moderate-text.dto';
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

	setInput(object: any): string[] {
		return Object.values(object)
			.filter((value: any) => Boolean(value))
			.map((value: any) => String(value))
			.map((value: string) => {
				const regExp: RegExp = /.{1,2000}/g;

				/** For higher accuracy, try splitting long pieces of text into smaller chunks each less than 2,000 characters. */

				if (value.length >= 2000) {
					return value.match(regExp);
				} else {
					return value;
				}
			})
			.flat();
	}

	/** Predictions */

	getModeratedTextIsSafe(aiModerateTextResult: AIModerateTextResult): boolean {
		// prettier-ignore
		return Object.values(aiModerateTextResult.results).every((aiModerateTextResultItem: AIModerateTextResultItem) => {
			return aiModerateTextResultItem.flagged === false;
		});
	}

	getModeratedImageIsSafe(aiModerateImageResultList: AIModerateImageResult[]): boolean {
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
			map((response: any) => response.data),
			switchMap((aiModerateTextResult: AIModerateTextResult) => {
				if (this.getModeratedTextIsSafe(aiModerateTextResult)) {
					return of(aiModerateTextResult);
				} else {
					return throwError(() => new Error('Seems like your input is prohibited to submit'));
				}
			}),
			catchError((error: Error) => this.apiService.setError(error))
		);
	}

	moderateImage(formData: FormData): Observable<AIModerateImageResult[]> {
		return this.httpClient.post(this.setUrl('/moderation/image'), formData).pipe(
			map((response: any) => response.data),
			switchMap((aiModerateImageResult: AIModerateImageResult[]) => {
				if (this.getModeratedImageIsSafe(aiModerateImageResult)) {
					return of(aiModerateImageResult);
				} else {
					return throwError(() => new Error('The image contains prohibited content'));
				}
			}),
			catchError((error: Error) => this.apiService.setError(error))
		);
	}
}
