/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PasswordCheckGetDto } from '../dto/password/password-check-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { User } from '../models/user.model';

@Injectable({
	providedIn: 'root'
})
export class PasswordService {
	constructor(private apiService: ApiService) {}

	onCheckGet(passwordCheckGetDto: PasswordCheckGetDto): Observable<any> {
		return this.apiService.get('/password/check', passwordCheckGetDto);
	}

	// prettier-ignore
	onResetGet(passwordResetGetDto: PasswordResetGetDto): Observable<Partial<User>> {
    return this.apiService.get('/password/reset', passwordResetGetDto);
  }

	// prettier-ignore
	onResetUpdate(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<Partial<User>> {
    return this.apiService.put('/password/reset', passwordResetUpdateDto);
  }
}
