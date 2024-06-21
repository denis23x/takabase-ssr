/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { PlatformService } from '../core/services/platform.service';
import { fromEvent, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedComponent } from '../standalone/components/authenticated/authenticated.component';
import { SvgLogoComponent } from '../standalone/components/svg-logo/svg-logo.component';
import { TitleService } from '../core/services/title.service';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, AuthenticatedComponent, SvgLogoComponent],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly platformService: PlatformService = inject(PlatformService);

	// prettier-ignore
	appFeatureList: any[] = [
		{
			id: 1,
			icon: 'gem',
			title: 'Clarity',
			description: 'By eliminating direct messaging and likes, the environment allows users to focus on sharing knowledge and experiences without the noise of constant notifications.',
      list: [
				{
					title: 'Topic Diversity',
					description: 'Explore a wide range of topics and interests, with dedicated spaces for enthusiasts, hobbyists, and experts to share their passions.'
				},
				{
					title: 'Customizable Themes',
					description: 'Personalize your writing space with a variety of themes. Choose the one that suits your style and mood, enhancing your overall writing experience.'
				},
				{
					title: 'Social Authorization',
					description: 'Enjoy the convenience of social authorization. Link your existing social media accounts with Takabase, allowing you to log in quickly without the need to remember additional usernames and passwords.'
				},
				{
					title: 'Minimalistic UI',
					description: "Enjoy a clutter-free and easy-to-navigate user interface. This website's design focuses on essential elements, ensuring a clean and intuitive mobile experience."
				}
			]
		},
		{
			id: 2,
			icon: 'robot',
			title: 'PWA',
			description: "Access the website even when you're offline or facing unreliable network connectivity. Progressive Web App technology ensures that you can continue browsing and interacting with content without interruption.",
      list: [
				{
					title: 'Responsive Layout',
					description: "Experience consistent and intuitive browsing across a range of mobile devices. This website's responsive design ensures that content adapts seamlessly to various screen sizes and orientations."
				},
				{
					title: 'Touch-Friendly Interactions',
					description: "Engage with the website's interactive elements using touch gestures. Navigation, scrolling, and interactions are tailored for touchscreens, providing a natural and enjoyable experience."
				},
				{
					title: 'Optimized Images and Media',
					description: 'Visuals load quickly without compromising quality. Images and media are compressed and optimized for mobile devices, balancing aesthetics with performance.'
				},
				{
					title: 'Cross-Platform Compatibility',
					description: "Access the website across various mobile platforms and operating systems. Whether you're on iOS, Android, or other platforms, the experience remains consistent."
				}
			]
		},
		{
			id: 3,
			icon: 'markdown',
			title: 'Markdown',
			description: 'Unlock the potential of your writing with an intuitive Markdown editor equipped with an array of powerful built-in tools. Experience the joy of effortless content creation today.',
      list: [
				{
					title: 'Real-time Preview',
					description: 'Witness the magic of your Markdown content transforming into a live preview as you type. See exactly how your text will appear before you even publish it.'
				},
				{
					title: 'Syntax Highlighting',
					description: 'Watch your code snippets come alive with syntax highlighting. Easily differentiate between various code elements for different programming languages.'
				},
				{
					title: 'Keyboard Shortcuts',
					description: 'Accelerate your workflow with a collection of convenient keyboard shortcuts designed to speed up common formatting tasks.'
				},
				{
					title: 'Inline Styling',
					description: 'Fine-tune your text and elements with inline styles. Customize fonts, colors, and backgrounds directly within your Markdown document.'
				}
			]
		}
	];
	appFeatureActive: any;

	appPWAAvailable: boolean = false;
	appPWAInstallPromt: any = null;
	appPWAInstallPromt$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
		this.setTitle();

		// if (this.platformService.isBrowser()) {
		// 	// @ts-ignore
		// 	(adsbygoogle = window.adsbygoogle || []).push({});
		// }
	}

	ngOnDestroy(): void {
		[this.appPWAInstallPromt$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.appPWAInstallPromt$?.unsubscribe();
			this.appPWAInstallPromt$ = fromEvent(window, 'beforeinstallprompt')
				.pipe(tap((event: Event) => event.preventDefault()))
				.subscribe({
					next: (event: Event) => {
						this.appPWAAvailable = true;
						this.appPWAInstallPromt = event;
					},
					error: (error: any) => console.error(error)
				});
		}

		// Set default

		this.onClickNav(this.appFeatureList[0]);
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

	onClickPWAInstall(): void {
		this.appPWAInstallPromt.prompt().then((event: any) => (this.appPWAAvailable = event.outcome !== 'accepted'));

		this.appPWAInstallPromt = null;
	}
}
