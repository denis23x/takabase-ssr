/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { CategoryModule } from '../category/category.module';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, CategoryModule],
  declarations: [ProfileComponent]
})
export class ProfileModule {}
