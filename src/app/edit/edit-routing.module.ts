/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditComponent } from './edit.component';
import { EditResolverService } from './edit-resolver.service';
import { CategoryHandlerComponent } from '../category/handler/handler.component';

const routes: Routes = [
  {
    path: ':postId',
    component: EditComponent,
    resolve: {
      data: EditResolverService
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
export class EditRoutingModule {}
