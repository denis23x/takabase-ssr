/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SearchResolverService } from './search-resolver.service';
import { PostsDetailComponent } from '../posts/detail/detail.component';
import { PostsDetailResolverService } from '../posts/detail/detail-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    resolve: {
      data: SearchResolverService
    },
    children: [
      {
        path: 'posts/:id',
        component: PostsDetailComponent,
        resolve: {
          data: PostsDetailResolverService
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
