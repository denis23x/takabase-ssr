/** @format */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	selector: 'app-ad, [appAd]',
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './ad.component.html'
})
export class AdComponent {}
