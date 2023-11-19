/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class SearchService {
	// prettier-ignore
	getSearchGetAllDto(getAllDto: any, activatedRouteSnapshot: ActivatedRouteSnapshot): any {
    const query: string = String(activatedRouteSnapshot.queryParamMap.get('query') || '');

    if (query.length) {
      getAllDto = {
        ...getAllDto,
        query
      };
    }

    const orderBy: string = String(activatedRouteSnapshot.queryParamMap.get('orderBy') || '');

    if (orderBy.length) {
      getAllDto = {
        ...getAllDto,
        orderBy
      };
    }

    return getAllDto;
  }
}
