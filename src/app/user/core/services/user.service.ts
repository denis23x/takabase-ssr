/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<User[]> {
    return this.apiService.get('/users', params);
  }

  getOne(id: number): Observable<User> {
    return this.apiService.get('/users/' + id);
  }
}
