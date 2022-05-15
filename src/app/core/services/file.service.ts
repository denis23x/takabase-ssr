/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private apiService: ApiService) {}

  create(anyDto: any): Observable<any> {
    return this.apiService.post2('/files', anyDto);
  }
}
