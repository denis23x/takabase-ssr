/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchPostsComponent } from './posts/posts.component';
import { SearchCategoriesComponent } from './categories/categories.component';
import { SearchUsersComponent } from './users/users.component';

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
