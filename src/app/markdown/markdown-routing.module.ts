/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { MarkdownComponent } from './markdown.component';
import { MarkdownResolverService } from './markdown-resolver.service';

const routes: Routes = [
  {
    matcher: (url: UrlSegment[]) => {
      switch (url.length) {
        case 0:
          return { consumed: url };
        case 1:
          return Number(url[0].path) ? { consumed: url } : null;
        default:
          return null;
      }
    },
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
