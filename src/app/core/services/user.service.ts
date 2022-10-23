/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { User } from '../models';
import { MeDto, RegistrationDto, UserGetAllDto, UserUpdateDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getMe(meDto: MeDto): Observable<User> {
    return this.apiService.get('/auth/me', meDto);
  }

  create(registrationDto: RegistrationDto): Observable<User> {
    return this.apiService.post('/auth/registration', registrationDto);
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
