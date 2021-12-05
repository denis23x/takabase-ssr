/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from './user-resolver.service';
import { PostComponent } from '../post/post.component';
import { PostResolverService } from '../post/post-resolver.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryResolverService } from '../category/category-resolver.service';
import { UserGuard } from './core';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':userId',
    component: UserComponent,
    canActivate: [UserGuard],
    resolve: {
      data: UserResolverService
    },
    children: [
      {
        path: '',
        component: CategoryComponent,
        resolve: {
          data: CategoryResolverService
        },
        children: [
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: PostComponent,
            resolve: {
              data: PostResolverService
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
        component: CategoryComponent,
        resolve: {
          data: CategoryResolverService
        },
        children: [
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: PostComponent,
            resolve: {
              data: PostResolverService
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
