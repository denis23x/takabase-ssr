/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchResolverService } from './search-resolver.service';
import { SearchService } from './core';

@NgModule({
  imports: [SharedModule, SearchRoutingModule],
  declarations: [SearchComponent],
  providers: [SearchResolverService, SearchService]
})
export class SearchModule {}
