/** @format */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollPresetDirective, SearchFormComponent],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent {}
