/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
	AIModerateTextDto,
	AIModerateTextResult,
	AIModerateTextResultItem
} from '../dto/ai/ai-moderate-text.dto';
import { AIModerateImageResult } from '../dto/ai/ai-moderate-image.dto';
import { SnackbarService } from './snackbar.service';

@Injectable({
	providedIn: 'root'
})
export class AIService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	setUrl(url: string): string {
		return environment.ai.url + url;
	}

	setInput(object: any): string[] {
		return Object.values(object)
			.filter((value: any) => Boolean(value))
			.map((value: any) => String(value))
			.map((value: string) => {
				const regExp: RegExp = /.{1,2000}/g;

				/** For higher accuracy, try splitting long pieces of text into smaller chunks each less than 2,000 characters */

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

	moderateText(aiModerateTextDto: AIModerateTextDto): Observable<boolean> {
		if (environment.ai.moderation) {
			// prettier-ignore
			return this.httpClient.post(this.setUrl('/v1/moderation/text'), aiModerateTextDto).pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpErrorResponse)),
				map((response: any) => response.data),
				switchMap((aiModerateTextResult: AIModerateTextResult) => {
					if (this.getModeratedTextIsSafe(aiModerateTextResult)) {
						return of(true);
					} else {
						this.snackbarService.warning('Moderation', 'Seems like your input is prohibited to submit', {
							icon: 'ban',
							duration: 6000
						});

						/** Return Error for break the pipe */

						return throwError(() => new Error());
					}
				})
			);
		}

		return of(false);
	}

	moderateImage(formData: FormData): Observable<boolean> {
		if (environment.ai.moderation) {
			// prettier-ignore
			return this.httpClient.post(this.setUrl('/v1/moderation/image'), formData).pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpErrorResponse)),
				map((response: any) => response.data),
				switchMap((aiModerateImageResult: AIModerateImageResult[]) => {
					if (this.getModeratedImageIsSafe(aiModerateImageResult)) {
						return of(true);
					} else {
						this.snackbarService.warning('Moderation', 'The image contains prohibited content', {
							icon: 'ban',
							duration: 6000
						});

						/** Return Error for break the pipe */

						return throwError(() => new Error());
					}
				})
			);
		}

		return of(false);
	}
}
