/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from './user-resolver.service';
import { UserCategoryComponent } from './category/category.component';
import { UserCategoryResolverService } from './category/category-resolver.service';
import { UserPostComponent } from './post/post.component';
import { UserPostResolverService } from './post/post-resolver.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':userId',
    component: UserComponent,
    resolve: {
      data: UserResolverService
    },
    children: [
      {
        path: '',
        component: UserCategoryComponent,
        resolve: {
          data: UserCategoryResolverService
        }
      },
      {
        path: 'category',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'category/:categoryId',
        component: UserCategoryComponent,
        resolve: {
          data: UserCategoryResolverService
        },
        children: [
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: UserPostComponent,
            resolve: {
              data: UserPostResolverService
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
