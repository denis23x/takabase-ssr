/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UserPostDetailComponent } from './post/detail/detail.component';
import { UserPostComponent } from './post/post.component';

@NgModule({
	imports: [SharedModule, UserRoutingModule],
	declarations: [UserComponent, UserPostDetailComponent, UserPostComponent]
})
export class UserModule {}
