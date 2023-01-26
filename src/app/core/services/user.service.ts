/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { User } from '../models';
import { UserCreateDto, UserGetAllDto, UserUpdateDto } from '../dto';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(private apiService: ApiService) {}

	getUserUrl(user: User): string {
		return ['/@', user.name].join('');
	}

	/** REST */

	create(userCreateDto: UserCreateDto): Observable<User> {
		return this.apiService.post('/users', userCreateDto);
	}

	getAll(userGetAllDto?: UserGetAllDto): Observable<User[]> {
		return this.apiService.get('/users', userGetAllDto);
	}

	getOne(id: number): Observable<User> {
		return this.apiService.get('/users/' + id);
	}

	update(id: number, userUpdateDto: UserUpdateDto): Observable<User> {
		return this.apiService.put('/users/' + id, userUpdateDto);
	}

	deleteMe(): Observable<User> {
		return this.apiService.delete('/users/me');
	}
}
