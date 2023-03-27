/** @format */

import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	selector: 'app-oauth, [appOauth]',
	imports: [SvgIconComponent],
	templateUrl: './oauth.component.html'
})
export class OauthComponent implements OnInit {
	apiUrl: string = environment.API_URL;

	constructor() {}

	ngOnInit(): void {}
}
