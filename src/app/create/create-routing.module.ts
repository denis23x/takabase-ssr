/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create.component';
import { CreateResolverService } from './create-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateComponent,
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
