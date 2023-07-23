/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { EmailConfirmationUpdateDto } from '../dto/email/email-confirmation-update.dto';

@Injectable({
	providedIn: 'root'
})
export class EmailService {
	constructor(private apiService: ApiService) {}

	onConfirmationGet(): Observable<Partial<User>> {
		return this.apiService.get('/email/confirmation');
	}

	// prettier-ignore
	onConfirmationUpdate(emailConfirmationUpdateDto: EmailConfirmationUpdateDto): Observable<Partial<User>> {
    return this.apiService.put('/email/confirmation', emailConfirmationUpdateDto);
  }
}
