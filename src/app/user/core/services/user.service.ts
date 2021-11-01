/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core';
import { User } from '../models';
import { Category } from '../../../category/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<User[]> {
    return this.apiService.get('/users', params);
  }

  getProfile(): Observable<User> {
    return this.apiService.get('/users/profile');
  }

  getOne(id: number): Observable<User> {
    return this.apiService.get('/users/' + id);
  }

  updateProfile(body: any): Observable<User> {
    return this.apiService.put('/users/profile', body);
  }

  deleteProfile(): Observable<User> {
    return this.apiService.delete('/users/profile');
  }
}
