/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { CommonModule } from '@angular/common';
import { AppAuthenticatedDirective } from '../standalone/directives/app-authenticated.directive';
import { PlatformService } from '../core/services/platform.service';
import { fromEvent, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, CommonModule, AppAuthenticatedDirective],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	constructor(
		private metaService: MetaService,
		private platformService: PlatformService
	) {}

	appFeatureList: any[] = [
		{
			icon: 'gem',
			title: 'Distraction-Free',
			description:
				'By eliminating direct messaging and likes, we create an environment where users can focus on sharing knowledge and experiences without the noise of constant notifications.',
			featureList: [
				{
					title: 'Topic Diversity',
					description:
						'Explore a wide range of topics and interests, with dedicated spaces for enthusiasts, hobbyists, and experts to share their passions.'
				},
				{
					title: 'Continuous Improvement',
					description:
						"We value user feedback and are committed to continuously enhancing the platform's features and usability based on community input."
				},
				{
					title: 'Customizable Themes',
					description:
						'Personalize your writing space with a variety of themes. Choose the one that suits your style and mood, enhancing your overall writing experience.'
				},
				{
					title: 'Social Authorization',
					description:
						'Enjoy the convenience of social authorization. Link your existing social media accounts to our platform, allowing you to log in quickly without the need to remember additional usernames and passwords.'
				}
			]
		},
		{
			icon: 'robot',
			title: 'Progressive Web App',
			description:
				"Access the website even when you're offline or facing unreliable network connectivity. Our Progressive Web App technology ensures that you can continue browsing and interacting with content without interruption.",
			featureList: [
				{
					title: 'Automatic Content Caching',
					description:
						'Experience faster load times by leveraging automatic content caching. The website intelligently stores essential resources, allowing you to access them quickly, even in low connectivity scenarios.'
				},
				{
					title: 'Responsive Layout',
					description:
						"Experience consistent and intuitive browsing across a range of mobile devices. Our website's responsive design ensures that content adapts seamlessly to various screen sizes and orientations."
				},
				{
					title: 'Touch-Friendly Interactions',
					description:
						"Engage with the website's interactive elements using touch gestures. Navigation, scrolling, and interactions are tailored for touchscreens, providing a natural and enjoyable experience."
				},
				{
					title: 'Minimalistic UI',
					description:
						"Enjoy a clutter-free and easy-to-navigate user interface. Our website's design focuses on essential elements, ensuring a clean and intuitive mobile experience."
				},
				{
					title: 'Optimized Images and Media',
					description:
						'Visuals load quickly without compromising quality. Images and media are compressed and optimized for mobile devices, balancing aesthetics with performance.'
				},
				{
					title: 'Cross-Platform Compatibility',
					description:
						"Access the website across various mobile platforms and operating systems. Whether you're on iOS, Android, or other platforms, the experience remains consistent."
				}
			]
		},
		{
			icon: 'markdown',
			title: 'Markdown Editor',
			description:
				"Unlock the potential of your writing with an intuitive Markdown editor equipped with an array of powerful built-in tools. Whether you're a writer, coder, or content creator, our editor simplifies the process while elevating your results. Experience the joy of effortless content creation today.",
			featureList: [
				{
					title: 'Real-time Preview',
					description:
						'Witness the magic of your Markdown content transforming into a live preview as you type. See exactly how your text will appear before you even publish it.'
				},
				{
					title: 'Syntax Highlighting',
					description:
						'Watch your code snippets come alive with syntax highlighting. Easily differentiate between various code elements for different programming languages.'
				},
				{
					title: 'Keyboard Shortcuts',
					description:
						'Accelerate your workflow with a collection of convenient keyboard shortcuts designed to speed up common formatting tasks.'
				},
				{
					title: 'Inline Styling',
					description:
						'Fine-tune your text and elements with inline styles. Customize fonts, colors, and backgrounds directly within your Markdown document.'
				}
			]
		}
	];

	appPWAAvailable: boolean = false;
	appPWAInstallPromt: any = null;
	appPWAInstallPromt$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.appPWAInstallPromt$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

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
	}

	setMetaTags(): void {
		const title: string = 'Draft';
		const description: string = 'Stay up to date with the latest posts and insights from Draft';

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

	onClickPWAInstall(): void {
		this.appPWAInstallPromt
			.prompt()
			.then((event: any) => (this.appPWAAvailable = event.outcome !== 'accepted'));

		this.appPWAInstallPromt = null;
	}
}
