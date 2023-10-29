/** @format */

import { Injectable } from '@angular/core';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class SearchService {
	// prettier-ignore
	getSearchGetAllDto(getAllDto: any, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto {
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
