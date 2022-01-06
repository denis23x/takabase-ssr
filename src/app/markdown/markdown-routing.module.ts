/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import { MarkdownResolverService } from './markdown-resolver.service';
import { CategoryCreateComponent } from '../shared';

const routes: Routes = [
  {
    path: '',
    component: MarkdownComponent,
    children: [
      {
        path: 'category',
        component: CategoryCreateComponent
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
        path: 'category',
        component: CategoryCreateComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkdownRoutingModule {}
