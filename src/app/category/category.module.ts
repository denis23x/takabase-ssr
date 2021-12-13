/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryComponent } from './category.component';
import { CategoryHandlerComponent } from './handler/handler.component';
import { CategoryRoutingModule } from './category-routing.module';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [CategoryComponent, CategoryHandlerComponent],
  exports: [CategoryComponent, CategoryHandlerComponent]
})
export class CategoryModule {}
