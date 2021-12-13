/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create.component';
import { CreateResolverService } from './create-resolver.service';
import { CategoryHandlerComponent } from '../category/handler/handler.component';

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
        component: CategoryHandlerComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRoutingModule {}
