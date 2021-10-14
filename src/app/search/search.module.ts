/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SearchCategoriesComponent } from './category/category.component';
import { SearchPostsComponent } from './post/post.component';
import { SearchUsersComponent } from './user/user.component';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [
    SearchComponent,
    SearchCategoriesComponent,
    SearchPostsComponent,
    SearchUsersComponent
  ]
})
export class SearchModule {}
