/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SearchPostsComponent } from './post/post.component';
import { SearchPostsResolverService } from './post/post-resolver.service';
import { SearchCategoriesComponent } from './category/category.component';
import { SearchCategoriesResolverService } from './category/category-resolver.service';
import { SearchUsersComponent } from './user/user.component';
import { SearchUsersResolverService } from './user/user-resolver.service';
import { PostComponent } from '../post/post.component';
import { PostResolverService } from '../post/post-resolver.service';

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
            path: ':postId',
            component: PostComponent,
            resolve: {
              data: PostResolverService
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
