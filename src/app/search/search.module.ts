/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';
import { SearchCategoryComponent } from './category/category.component';
import { SearchUserComponent } from './user/user.component';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [SearchComponent, SearchCategoryComponent, SearchUserComponent]
})
export class SearchModule {}
