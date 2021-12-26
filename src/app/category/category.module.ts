/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryRoutingModule } from './category-routing.module';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [CategoryComponent],
  exports: [CategoryComponent]
})
export class CategoryModule {}
