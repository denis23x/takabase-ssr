/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { User } from '../models';
import { UserGetAllDto, UserUpdateOneDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(userGetAllDto?: UserGetAllDto): Observable<User[]> {
    return this.apiService.get('/users', { ...userGetAllDto });
  }

  getAllByName(userGetAllDto?: UserGetAllDto): Observable<User> {
    return this.apiService.get('/users', { ...userGetAllDto });
  }

  getProfile(userGetOneDto?: UserGetAllDto): Observable<User> {
    return this.apiService.get('/users/profile', { ...userGetOneDto });
  }

  getOne(id: number): Observable<User> {
    return this.apiService.get('/users/' + id);
  }

  updateProfile(userUpdateOneDto: UserUpdateOneDto): Observable<User> {
    return this.apiService.put('/users/profile', { ...userUpdateOneDto });
  }

  deleteProfile(): Observable<User> {
    return this.apiService.delete('/users/profile');
  }
}
