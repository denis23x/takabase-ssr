/** @format */

import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { SharedModule } from '../shared';

@Component({
	standalone: true,
	imports: [SharedModule],
	selector: 'app-auth',
	templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
	apiUrl: string = environment.API_URL;

	constructor() {}

	ngOnInit(): void {}
}
