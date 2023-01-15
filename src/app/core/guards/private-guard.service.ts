/** @format */

import { Injectable } from '@angular/core';
import { CanMatch } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services';

@Injectable({
	providedIn: 'root'
})
export class CanMatchPrivateGuard implements CanMatch {
	constructor(private authService: AuthService) {}

	canMatch(): Observable<boolean> {
		return this.authService.guardPrivate();
	}
}
