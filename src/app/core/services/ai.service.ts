/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SnackbarService } from './snackbar.service';
import type { HttpErrorResponse } from '@angular/common/http';
import type { ModerationCreateDto } from '../dto/moderation/moderate-create.dto';
import type { ModerationResult, ModerationResultItem } from '../models/moderation.dto';
import type { NSFWResult } from '../models/nsfw.model';

@Injectable()
export class AIService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	setUrl(url: string): string {
		return environment.ai.url + url;
	}

	getModerationCreateTextDto(object: any): ModerationCreateDto {
		return {
			model: 'omni-moderation-latest',
			input: Object.values(object)
				.filter((value: any) => Boolean(value))
				.map((value: any) => ({
					type: 'text',
					text: String(value)
				}))
		};
	}

	/** Predictions */

	getIsSafeOpenAI(moderateTextResult: ModerationResult): boolean {
		return Object.values(moderateTextResult.results).every((moderateTextResultItem: ModerationResultItem) => {
			return moderateTextResultItem.flagged === false;
		});
	}

	getIsSafeNSFW(nsfwResult: NSFWResult[]): boolean {
		const nsfwCategoryList: string[] = ['Porn', 'Sexy', 'Hentai'];

		/** https://github.com/infinitered/nsfwjs */

		// prettier-ignore
		const nsfwCategoryListResult: NSFWResult[] = nsfwResult.filter((aiModerateImage: NSFWResult) => {
      return nsfwCategoryList.includes(aiModerateImage.className)
    });

		// prettier-ignore
		const nsfwProbability: number = nsfwCategoryListResult.reduce((accumulator: number, aiModerateImage: NSFWResult) => accumulator + aiModerateImage.probability, 0);
		const nsfwProbabilityMax: number = 0.5;

		return nsfwProbability < nsfwProbabilityMax;
	}

	/** AI function */

	getModerationOpenAI(moderationCreateDto: ModerationCreateDto): Observable<boolean> {
		return this.httpClient.post(this.setUrl('/api/v1/moderation/openai'), moderationCreateDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpErrorResponse)),
			map((response: any) => response.data),
			switchMap((moderationResult: ModerationResult) => {
				if (this.getIsSafeOpenAI(moderationResult)) {
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

	getModerationNSFW(formData: FormData): Observable<boolean> {
		return this.httpClient.post(this.setUrl('/api/v1/moderation/nsfw'), formData).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpErrorResponse)),
			map((response: any) => response.data),
			switchMap((nsfwResult: NSFWResult[]) => {
				if (this.getIsSafeNSFW(nsfwResult)) {
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
}
