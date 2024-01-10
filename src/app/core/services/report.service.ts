/** @format */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Report } from '../models/report.model';
import { ReportCreateDto } from '../dto/report/report-create.dto';

@Injectable({
	providedIn: 'root'
})
export class ReportService {
	private readonly apiService: ApiService = inject(ApiService);

	reportDialogToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	/** REST */

	create(reportCreateDto: ReportCreateDto): Observable<Report> {
		return this.apiService.post('/reports', reportCreateDto);
	}
}
