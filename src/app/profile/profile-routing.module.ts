/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileResolverService } from './profile-resolver.service';
import { ProfilePostDetailComponent } from './post/detail/detail.component';
import { ProfilePostDetailResolverService } from './post/detail/detail-resolver.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryResolverService } from '../category/category-resolver.service';
import { CategoryHandlerComponent } from '../category/handler/handler.component';
import { CategoryHandlerResolverService } from '../category/handler/handler-resolver.service';

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
            component: CategoryHandlerComponent
          },
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: ProfilePostDetailComponent,
            resolve: {
              data: ProfilePostDetailResolverService
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
            component: CategoryHandlerComponent
          },
          {
            path: 'edit',
            component: CategoryHandlerComponent,
            resolve: {
              data: CategoryHandlerResolverService
            }
          },
          {
            path: 'posts',
            redirectTo: '',
            pathMatch: 'full'
          },
          {
            path: 'posts/:postId',
            component: ProfilePostDetailComponent,
            resolve: {
              data: ProfilePostDetailResolverService
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
