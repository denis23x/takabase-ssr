/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UserCategoryComponent } from './category/category.component';
import { UserPostDetailComponent } from './post/detail/detail.component';

@NgModule({
	imports: [SharedModule, UserRoutingModule],
	declarations: [UserComponent, UserCategoryComponent, UserPostDetailComponent]
})
export class UserModule {}
