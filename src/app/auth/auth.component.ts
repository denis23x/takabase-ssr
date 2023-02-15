/** @format */

import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../shared/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent],
	selector: 'app-auth',
	templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
	apiUrl: string = environment.API_URL;

	constructor() {}

	ngOnInit(): void {}
}
