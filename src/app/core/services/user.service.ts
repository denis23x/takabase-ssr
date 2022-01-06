/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<User[]> {
    return this.apiService.get('/users', params);
  }

  getAllByName(params?: any): Observable<User> {
    return this.apiService.get('/users', params);
  }

  getProfile(params?: any): Observable<User> {
    return this.apiService.get('/users/profile', params);
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
