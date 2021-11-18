/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostsCreateComponent } from './create/create.component';
import { PostCreateResolverService } from './create/create-resolver.service';
import { AuthGuard } from '../auth/guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: PostsCreateComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: PostCreateResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {}
