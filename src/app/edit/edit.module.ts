/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { EditRoutingModule } from './edit-routing.module';
import { EditComponent } from './edit.component';
import { CategoryModule } from '../category/category.module';
import { PostModule } from '../post/post.module';

@NgModule({
  imports: [SharedModule, EditRoutingModule, CategoryModule, PostModule],
  declarations: [EditComponent]
})
export class EditModule {}
