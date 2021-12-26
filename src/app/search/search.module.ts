/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SearchCategoryComponent } from './category/category.component';
import { SearchPostComponent } from './post/post.component';
import { SearchPostDetailComponent } from './post/detail/detail.component';
import { SearchUserComponent } from './user/user.component';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [
    SearchComponent,
    SearchCategoryComponent,
    SearchPostComponent,
    SearchPostDetailComponent,
    SearchUserComponent
  ]
})
export class SearchModule {}
