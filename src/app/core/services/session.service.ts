/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Session } from '../models/session.model';

@Injectable({
	providedIn: 'root'
})
export class SessionService {
	constructor(private apiService: ApiService) {}

	getAll(): Observable<Session[]> {
		return this.apiService.get('/sessions');
	}

	delete(id: number): Observable<Session> {
		return this.apiService.delete('/sessions/' + id);
	}
}
