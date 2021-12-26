/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { ProfilePostDetailComponent } from './post/detail/detail.component';
import { CategoryModule } from '../category/category.module';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, CategoryModule],
  declarations: [ProfileComponent, ProfilePostDetailComponent]
})
export class ProfileModule {}
