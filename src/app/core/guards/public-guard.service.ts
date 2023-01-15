/** @format */

import { Injectable } from '@angular/core';
import { CanMatch } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services';

@Injectable({
	providedIn: 'root'
})
export class CanMatchPublicGuard implements CanMatch {
	constructor(private authService: AuthService) {}

	canMatch(): Observable<boolean> {
		return this.authService.guardPublic();
	}
}
