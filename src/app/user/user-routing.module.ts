/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from './user-resolver.service';
import { PostComponent } from '../post/post.component';
import { PostResolverService } from '../post/post-resolver.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: UserComponent,
    resolve: {
      data: UserResolverService
    },
    children: [
      {
        path: 'posts/:id',
        component: PostComponent,
        resolve: {
          data: PostResolverService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
