/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import { MarkdownResolverService } from './markdown-resolver.service';
import { PostCreateComponent, PostCreateResolverService } from '../shared';

const routes: Routes = [
  {
    path: '',
    component: MarkdownComponent,
    children: [
      {
        path: 'submit',
        component: PostCreateComponent,
        resolve: {
          data: PostCreateResolverService
        }
      }
    ]
  },
  {
    path: ':postId',
    component: MarkdownComponent,
    resolve: {
      data: MarkdownResolverService
    },
    children: [
      {
        path: 'submit',
        component: PostCreateComponent,
        resolve: {
          data: PostCreateResolverService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkdownRoutingModule {}
