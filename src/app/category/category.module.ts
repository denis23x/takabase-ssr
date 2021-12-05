/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryCreateViewComponent } from './create/create-view.component';
import { CategoryEditViewComponent } from './edit/edit.component';
import { CategoryCreateComponent, CategoryEditComponent } from './shared';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [
    CategoryComponent,
    CategoryCreateViewComponent,
    CategoryCreateComponent,
    CategoryEditViewComponent,
    CategoryEditComponent
  ],
  exports: [
    CategoryComponent,
    CategoryCreateViewComponent,
    CategoryCreateComponent,
    CategoryEditViewComponent,
    CategoryEditComponent
  ]
})
export class CategoryModule {}
