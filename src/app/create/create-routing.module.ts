/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create.component';
import { CreateResolverService } from './create-resolver.service';
import { CategoryCreateViewComponent } from '../category/create/create-view.component';
import { PostCreateViewComponent } from '../post/create/post-view.component';
import { PostCreateViewResolverService } from '../post/create/post-view-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
    resolve: {
      data: CreateResolverService
    },
    children: [
      {
        path: 'category',
        component: CategoryCreateViewComponent
      },
      {
        path: 'post',
        component: PostCreateViewComponent,
        resolve: {
          data: PostCreateViewResolverService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRoutingModule {}
