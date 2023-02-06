/** @format */

import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { SvgIconComponent } from '../shared';
import { RouterModule } from '@angular/router';

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
