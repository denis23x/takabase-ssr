/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create.component';
import { CreateResolverService } from './create-resolver.service';
import { AuthGuard } from '../auth/guards';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: CreateResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRoutingModule {}
