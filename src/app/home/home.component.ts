/** @format */

import { Component, ComponentRef, inject, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { SvgLogoComponent } from '../standalone/components/svg-logo/svg-logo.component';
import { TitleService } from '../core/services/title.service';
import homeFeatures from '../../assets/json/home-features.json';

// Types for lazy loading

import type { PWAComponent } from '../standalone/components/pwa/pwa.component';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, SvgLogoComponent],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	appFeatureList: any[] = homeFeatures;
	appFeatureActive: any = homeFeatures[0];

	// Lazy loading

	appPWAComponent: ComponentRef<PWAComponent>;

	ngOnInit(): void {
		/** Apply SEO meta tags */

		this.setMetaTags();
		this.setTitle();
	}

	setTitle(): void {
		this.titleService.setTitle('Home');
	}

	setMetaTags(): void {
		const title: string = 'Takabase';
		const description: string = 'Stay up to date with the latest posts and insights from Takabase';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	onClickNav(appFeature: any): void {
		this.appFeatureActive = appFeature;
	}

	/** LAZY */

	async onTogglePWADialog(): Promise<void> {
		if (!this.appPWAComponent) {
			const pwaComponent: Type<PWAComponent> = await import('../standalone/components/pwa/pwa.component').then(m => {
				return m.PWAComponent;
			});

			this.appPWAComponent = this.viewContainerRef.createComponent(pwaComponent);

			// Self-call
			await this.onTogglePWADialog();
		}

		this.appPWAComponent.changeDetectorRef.detectChanges();
		this.appPWAComponent.instance.onTogglePWADialog(true);
	}
}
