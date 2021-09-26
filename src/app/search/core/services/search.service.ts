/** @format */

import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable()
export class SearchService {
  public searchMap = new Map(
    Object.entries({
      categories: {
        query: 'title',
        service: 'categoriesService',
        list: 'categoryList'
      },
      users: {
        query: 'name',
        service: 'userService',
        list: 'userList'
      },
      posts: {
        query: 'title',
        service: 'postService',
        list: 'postList'
      }
    })
  );

  constructor() {}

  getValidateQuery(query: string): boolean {
    return !query.length || (query.length >= 4 && query.length <= 24);
  }

  getValidateTab(tab: string): boolean {
    return !tab.length || [...this.searchMap.keys()].includes(tab);
  }

  getControlValidateQuery(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.getValidateQuery(control.value)
        ? null
        : { validateQuery: true, requiredLength: 'Min length 4 and max length 24' };
    };
  }

  getControlValidateTab(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.getValidateTab(control.value)
        ? null
        : { validateTab: true, requiredValue: 'Must be Categories | Users | Posts' };
    };
  }
}
