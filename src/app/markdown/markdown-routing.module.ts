/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import { MarkdownResolverService } from './markdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: MarkdownComponent
  },
  {
    path: ':postId',
    component: MarkdownComponent,
    resolve: {
      data: MarkdownResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkdownRoutingModule {}
