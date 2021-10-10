/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchPostsComponent } from './post/post.component';
import { SearchCategoriesComponent } from './category/category.component';
import { SearchUsersComponent } from './user/user.component';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [
    SearchComponent,
    SearchPostsComponent,
    SearchCategoriesComponent,
    SearchUsersComponent
  ]
})
export class SearchModule {}
