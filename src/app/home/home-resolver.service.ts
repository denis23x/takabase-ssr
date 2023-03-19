/** @format */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class HomeResolverService {
	constructor(private httpClient: HttpClient, private router: Router) {}

	// prettier-ignore
	resolve(): Observable<any> {
    const requestOptions: any = {
      responseType: 'text'
    };

    return forkJoin([
      this.httpClient.get('/assets/markdown/home/features.md', requestOptions),
      this.httpClient.get('/assets/markdown/home/showcase.md', requestOptions),
      this.httpClient.get('/assets/markdown/home/code.md', requestOptions),
      this.httpClient.get('/assets/markdown/home/deep.md', requestOptions),
      this.httpClient.get('/assets/markdown/home/road.md', requestOptions),
    ]).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.router
          .navigate(['/error', httpErrorResponse.status])
          .then(() => console.debug('Route changed'));

        return throwError(() => httpErrorResponse);
      })
    );
	}
}
