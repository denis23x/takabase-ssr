/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PostService,
  CategoriesService,
  UserService,
  User,
  Category,
  Post,
  SearchDto
} from '../core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { SearchService } from './core';

@Injectable({
  providedIn: 'root'
})
export class SearchResolverService {
  page = 1;
  size = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private postService: PostService,
    private userService: UserService,
    private categoriesService: CategoriesService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Category[] | User[] | Post[]> {
    let searchMap: any = this.searchService.searchMap.get('posts');
    let searchDto: SearchDto = {
      page: this.page,
      size: this.size
    };

    const tab = route.queryParamMap.get('tab');
    const query = route.queryParamMap.get('query');

    if (tab) {
      if (this.searchService.getValidateTab(tab)) {
        searchMap = this.searchService.searchMap.get(tab);
      }
    }

    if (query) {
      if (this.searchService.getValidateQuery(query)) {
        searchDto = {
          ...searchDto,
          [searchMap.query]: query
        };
      }
    }

    return this[searchMap.service].getAll(searchDto);
  }
}
