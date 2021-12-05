/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryCreateComponent } from './shared';
import { CategoryCreateViewComponent } from './create/create-view.component';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [CategoryComponent, CategoryCreateViewComponent, CategoryCreateComponent],
  exports: [CategoryComponent, CategoryCreateViewComponent, CategoryCreateComponent]
})
export class CategoryModule {}
