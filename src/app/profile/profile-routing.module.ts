/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileResolverService } from './profile-resolver.service';
import { PostComponent } from '../post/post.component';
import { PostResolverService } from '../post/post-resolver.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryResolverService } from '../category/category-resolver.service';
import { AuthGuard } from '../auth/guards';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: ProfileResolverService
    },
    children: [
      {
        path: '',
        component: CategoryComponent,
        resolve: {
          data: CategoryResolverService
        }
      },
      {
        path: 'posts/:postId',
        component: PostComponent,
        resolve: {
          data: PostResolverService
        }
      },
      {
        path: 'category/:categoryId',
        component: CategoryComponent,
        resolve: {
          data: CategoryResolverService
        },
        children: [
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
