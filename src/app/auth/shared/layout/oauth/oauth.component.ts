/** @format */

import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-oauth, [appOauth]',
  templateUrl: './oauth.component.html'
})
export class OauthComponent implements OnInit {
  apiUrl: string = environment.api_url;

  constructor() {}

  ngOnInit(): void {}
}
