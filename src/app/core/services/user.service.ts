/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { User } from '../models/user.model';
import type { UserCreateDto } from '../dto/user/user-create.dto';
import type { UserGetAllDto } from '../dto/user/user-get-all.dto';
import type { UserGetOneDto } from '../dto/user/user-get-one.dto';
import type { UserUpdateDto } from '../dto/user/user-update.dto';
import type { UserDeleteDto } from '../dto/user/user-delete.dto';

@Injectable()
export class UserService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(userCreateDto: UserCreateDto): Observable<User> {
		return this.apiService.post('/v1/users', userCreateDto);
	}

	getAll(userGetAllDto?: UserGetAllDto): Observable<User[]> {
		return this.apiService.get('/v1/users', userGetAllDto);
	}

	getOne(id: number, userGetOneDto?: UserGetOneDto): Observable<User> {
		return this.apiService.get('/v1/users/' + id, userGetOneDto);
	}

	update(id: number, userUpdateDto: UserUpdateDto): Observable<User> {
		return this.apiService.put('/v1/users/' + id, userUpdateDto);
	}

	delete(id: number, userDeleteDto: UserDeleteDto): Observable<User> {
		return this.apiService.delete('/v1/users/' + id, userDeleteDto);
	}
}
