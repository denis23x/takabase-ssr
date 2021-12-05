/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryCreateViewComponent } from './create/create-view.component';
import { CategoryDeleteViewComponent } from './delete/delete.component';
import { CategoryEditViewComponent } from './edit/edit.component';
import { CategoryCreateComponent, CategoryDeleteComponent, CategoryEditComponent } from './shared';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [
    CategoryComponent,
    CategoryCreateViewComponent,
    CategoryCreateComponent,
    CategoryDeleteViewComponent,
    CategoryDeleteComponent,
    CategoryEditViewComponent,
    CategoryEditComponent
  ],
  exports: [
    CategoryComponent,
    CategoryCreateViewComponent,
    CategoryCreateComponent,
    CategoryDeleteViewComponent,
    CategoryDeleteComponent,
    CategoryEditViewComponent,
    CategoryEditComponent
  ]
})
export class CategoryModule {}
