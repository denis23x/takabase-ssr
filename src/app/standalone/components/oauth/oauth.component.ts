/** @format */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	selector: 'app-oauth, [appOAuth]',
	imports: [CommonModule, SvgIconComponent],
	templateUrl: './oauth.component.html'
})
export class OauthComponent {
	@Input()
	set appOAuthDisabled(OAuthDisabled: boolean) {
		this.OAuthDisabled = OAuthDisabled;
	}

	OAuthDisabled: boolean = false;
	OAuthApiUrl: string = environment.apiUrl;
}
