/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SearchPostsComponent } from './posts/posts.component';
import { SearchPostsResolverService } from './posts/posts-resolver.service';
import { SearchCategoriesComponent } from './categories/categories.component';
import { SearchCategoriesResolverService } from './categories/categories-resolver.service';
import { SearchUsersComponent } from './users/users.component';
import { SearchUsersResolverService } from './users/users-resolver.service';
import { PostsDetailComponent } from '../posts/detail/detail.component';
import { PostsDetailResolverService } from '../posts/detail/detail-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'posts'
      },
      {
        path: 'posts',
        component: SearchPostsComponent,
        resolve: {
          data: SearchPostsResolverService
        },
        children: [
          {
            path: ':id',
            component: PostsDetailComponent,
            resolve: {
              data: PostsDetailResolverService
            }
          }
        ]
      },
      {
        path: 'categories',
        component: SearchCategoriesComponent,
        resolve: {
          data: SearchCategoriesResolverService
        }
      },
      {
        path: 'users',
        component: SearchUsersComponent,
        resolve: {
          data: SearchUsersResolverService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule {}
