/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AIModerateTextDto } from '../dto/ai/ai-moderate-text.dto';

@Injectable({
	providedIn: 'root'
})
export class AIService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);

	setUrl(url: string): string {
		return environment.ai.url + url;
	}

	/** AI function */

	moderateText(aiModerateTextDto: AIModerateTextDto): Observable<any> {
		return this.httpClient.post(this.setUrl('/moderation/text'), aiModerateTextDto).pipe(
			map((response: any) => response.data || response),
			catchError((httpError: any) => this.apiService.setError(httpError))
		);
	}

	moderateImage(formData: FormData): Observable<any> {
		return this.httpClient.post(this.setUrl('/moderation/image'), formData).pipe(
			map((response: any) => response.data || response),
			catchError((httpError: any) => this.apiService.setError(httpError))
		);
	}
}
