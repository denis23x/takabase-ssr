/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FeedbackCreateDto } from '../dto/feedback/feedback-create.dto';
import { Feedback } from '../models/feedback.model';

@Injectable({
	providedIn: 'root'
})
export class FeedbackService {
	constructor(private apiService: ApiService) {}

	create(feedbackCreateDto: FeedbackCreateDto): Observable<Feedback> {
		return this.apiService.post('/feedbacks', feedbackCreateDto);
	}
}
