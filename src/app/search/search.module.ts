/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [SearchComponent]
})
export class SearchModule {}
