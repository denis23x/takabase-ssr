/** @format */

import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppConfigurationModule } from './app.configuration.module';
import { AppComponent } from './app.component';

@NgModule({
	imports: [AppConfigurationModule, ServerModule],
	bootstrap: [AppComponent]
})
export class AppServerModule {}
