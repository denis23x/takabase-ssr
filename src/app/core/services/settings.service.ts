/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Settings } from '../models/settings.model';
import { SettingsUpdateDto } from '../dto/settings/settings-update.dto';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {
	constructor(private apiService: ApiService) {}

	getOne(): Observable<Settings> {
		return this.apiService.get('/settings');
	}

	update(settingsUpdateDto: SettingsUpdateDto): Observable<Settings> {
		return this.apiService.put('/settings/', settingsUpdateDto);
	}
}
