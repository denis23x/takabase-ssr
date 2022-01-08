/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { User } from '../models';
import { UserGetAllDto, UserUpdateDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(userGetAllDto?: UserGetAllDto): Observable<User[]> {
    return this.apiService.get('/users', { ...userGetAllDto });
  }

  getMe(userGetOneDto?: UserGetAllDto): Observable<User> {
    return this.apiService.get('/users/me', { ...userGetOneDto });
  }

  getOne(id: number): Observable<User> {
    return this.apiService.get('/users/' + id);
  }

  updateMe(userUpdateDto: UserUpdateDto): Observable<User> {
    return this.apiService.put('/users/me', { ...userUpdateDto });
  }

  deleteMe(): Observable<User> {
    return this.apiService.delete('/users/me');
  }
}
