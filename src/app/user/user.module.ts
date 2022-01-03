/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UserCategoryComponent } from './category/category.component';
import { UserPostComponent } from './post/post.component';

@NgModule({
  imports: [SharedModule, UserRoutingModule],
  declarations: [UserComponent, UserCategoryComponent, UserPostComponent]
})
export class UserModule {}
