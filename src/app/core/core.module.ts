/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpAuthInterceptor } from './interceptors';

import {
  ApiService,
  AuthGuard,
  CategoriesService,
  HelperService,
  LocalStorageService,
  PlatformService,
  PostService,
  SnackbarService,
  UserService
} from './services';

@NgModule({
  imports: [CommonModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true },
    ApiService,
    AuthGuard,
    CategoriesService,
    HelperService,
    LocalStorageService,
    PlatformService,
    PostService,
    SnackbarService,
    UserService
  ],
  declarations: []
})
export class CoreModule {}
