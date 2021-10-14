/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryCreateComponent } from './create/create.component';
import { CategoryDeleteComponent } from './delete/delete.component';
import { CategoryEditComponent } from './edit/edit.component';
import { CategoryRoutingModule } from './category-routing.module';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [
    CategoryComponent,
    CategoryCreateComponent,
    CategoryDeleteComponent,
    CategoryEditComponent
  ]
})
export class CategoryModule {}
