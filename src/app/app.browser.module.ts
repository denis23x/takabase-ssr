/** @format */

import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppConfigurationModule } from './app.configuration.module';

@NgModule({
	imports: [AppConfigurationModule],
	bootstrap: [AppComponent]
})
export class AppBrowserModule {}
