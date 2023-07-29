/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Settings } from '../models/settings.model';
import { SettingsUpdateDto } from '../dto/settings/settings-update.dto';
import { AppearanceService } from './appearance.service';
import { HelperService } from './helper.service';
import { CookieService } from './cookie.service';

@Injectable({
	providedIn: 'root'
})
export class SettingsService {
	constructor(
		private apiService: ApiService,
		private appearanceService: AppearanceService,
		private helperService: HelperService,
		private cookieService: CookieService
	) {}

	setSettings(settings: Settings): void {
		const keyExcludeList: string[] = ['id', 'createdAt', 'updatedAt'];

		/** Set cookies */

		// prettier-ignore
		Object.keys(settings).filter((key: string) => !keyExcludeList.includes(key)).forEach((key: string) => {
      const value: any = settings[key];

      const cookieKey: string = this.helperService.setCamelCaseToDashCase(key);
      const cookieValue: any = typeof value === 'boolean' ? String(+value) : value;

      this.cookieService.setItem(cookieKey, cookieValue);
    });

		/** Set theme settings */

		this.appearanceService.setTheme(settings.theme);
		this.appearanceService.setThemeBackground(settings.themeBackground);
		this.appearanceService.setThemePrism(settings.themePrism);
	}

	removeSettings(settings: Settings): void {
		/** Remove cookies */

		// prettier-ignore
		Object.keys(settings).forEach((key: string) => {
      this.cookieService.removeItem(this.helperService.setCamelCaseToDashCase(key));
    });

		/** Remove theme settings */

		this.appearanceService.setTheme(null);
		this.appearanceService.setThemeBackground(null);
		this.appearanceService.setThemePrism(null);
	}

	/** REST */

	getOne(): Observable<Settings> {
		return this.apiService.get('/settings');
	}

	update(settingsUpdateDto: SettingsUpdateDto): Observable<Settings> {
		return this.apiService.put('/settings/', settingsUpdateDto);
	}
}
