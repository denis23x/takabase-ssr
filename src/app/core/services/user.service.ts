/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { UserGetAllDto } from '../dto/user/user-get-all.dto';
import { UserGetOneDto } from '../dto/user/user-get-one.dto';
import { UserUpdateDto } from '../dto/user/user-update.dto';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	constructor(private apiService: ApiService) {}

	/** Resolvers DTO */

	// prettier-ignore
	getSearchUserGetAllDto(userGetAllDto: UserGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): UserGetAllDto {
    const query: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (query.length) {
      userGetAllDto = {
        ...userGetAllDto,
        query
      };
    }

    const orderBy: string = String(activatedRouteSnapshot.parent.queryParamMap.get('orderBy') || '');

    if (orderBy.length) {
      userGetAllDto = {
        ...userGetAllDto,
        orderBy
      };
    }

    return userGetAllDto;
  }

	/** Utility */

	getUserUrl(user: User, substring: number = 0): string {
		return ('/@' + user.name).substring(substring);
	}

	/** REST */

	create(userCreateDto: UserCreateDto): Observable<User> {
		return this.apiService.post('/users', userCreateDto);
	}

	getAll(userGetAllDto?: UserGetAllDto): Observable<User[]> {
		return this.apiService.get('/users', userGetAllDto);
	}

	getOne(id: number, userGetOneDto?: UserGetOneDto): Observable<User> {
		return this.apiService.get('/users/' + id, userGetOneDto);
	}

	update(id: number, userUpdateDto: UserUpdateDto): Observable<User> {
		return this.apiService.put('/users/' + id, userUpdateDto);
	}

	delete(id: number): Observable<User> {
		return this.apiService.delete('/users/', id);
	}
}
