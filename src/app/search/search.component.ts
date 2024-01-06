/** @format */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ScrollPresetDirective, SearchFormComponent],
	selector: 'app-search',
	templateUrl: './search.component.html'
})
export class SearchComponent {}
