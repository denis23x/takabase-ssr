/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileResolverService } from './profile-resolver.service';
import { PostComponent } from '../post/post.component';
import { PostResolverService } from '../post/post-resolver.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryResolverService } from '../category/category-resolver.service';
import { CategoryCreateViewComponent } from '../category/create/create-view.component';
import { CategoryDeleteViewComponent } from '../category/delete/delete.component';
import { CategoryDeleteResolverService } from '../category/delete/delete-resolver.service';
import { CategoryEditViewComponent } from '../category/edit/edit.component';
import { CategoryEditResolverService } from '../category/edit/edit-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    resolve: {
      data: ProfileResolverService
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
            path: 'create',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'create/category',
            component: CategoryCreateViewComponent
          },
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
            path: 'create',
            component: CategoryCreateViewComponent
          },
          {
            path: 'delete',
            component: CategoryDeleteViewComponent,
            resolve: {
              data: CategoryDeleteResolverService
            }
          },
          {
            path: 'edit',
            component: CategoryEditViewComponent,
            resolve: {
              data: CategoryEditResolverService
            }
          },
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
export class ProfileRoutingModule {}
