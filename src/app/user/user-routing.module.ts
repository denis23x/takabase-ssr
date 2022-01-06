/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from './user-resolver.service';
import {
  CategoryCreateComponent,
  CategoryDetailComponent,
  CategoryDetailResolverService,
  PostDetailComponent,
  PostDetailResolverService
} from '../shared';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    resolve: {
      data: UserResolverService
    },
    children: [
      {
        path: '',
        component: CategoryDetailComponent,
        resolve: {
          data: CategoryDetailResolverService
        },
        children: [
          {
            path: 'create',
            component: CategoryCreateComponent
          },
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: PostDetailComponent,
            resolve: {
              data: PostDetailResolverService
            }
          }
        ]
      },
      {
        path: 'category',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'category/:categoryId',
        component: CategoryDetailComponent,
        resolve: {
          data: CategoryDetailResolverService
        },
        children: [
          {
            path: 'create',
            component: CategoryCreateComponent
          },
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: PostDetailComponent,
            resolve: {
              data: PostDetailResolverService
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
