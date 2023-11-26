/** @format */

import { Inject, Injectable } from '@angular/core';
import { Meta, MetaDefinition } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { MetaOpenGraph, MetaTwitter } from '../models/meta.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class MetaService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private meta: Meta
	) {}

	setCanonicalURL(): void {
		const linkElement: HTMLLinkElement = this.document.querySelector("link[rel='canonical']");

		if (linkElement) {
			linkElement.setAttribute('href', this.document.URL);
		} else {
			const linkElement: HTMLLinkElement = this.document.createElement('link');

			linkElement.setAttribute('rel', 'canonical');
			linkElement.setAttribute('href', this.document.URL);

			this.document.head.appendChild(linkElement);
		}
	}

	setMeta(metaOpenGraph: MetaOpenGraph, metaTwitter: MetaTwitter): void {
		this.setCanonicalURL();

		this.setMetaOpenGraph(metaOpenGraph);
		this.setMetaTwitter(metaTwitter);
	}

	/** OpenGraph */

	getMetaOpenGraph(): MetaOpenGraph {
		const metaTags: Partial<MetaOpenGraph | MetaTwitter> = {};

		['og', 'article', 'profile'].forEach((selector: string) => {
			const metaElement: HTMLMetaElement[] = this.meta.getTags("property^='" + selector + ":'");

			metaElement.forEach((metaElement: HTMLMetaElement) => {
				metaTags[metaElement.getAttribute('property')] = metaElement.content;
			});
		});

		return metaTags as MetaOpenGraph;
	}

	setMetaOpenGraph(metaOpenGraph: MetaOpenGraph): void {
		/** Clear all meta before setting */

		this.removeMetaOpenGraph(this.getMetaOpenGraph());

		/** Set new meta */

		metaOpenGraph = {
			...metaOpenGraph,
			['og:url']: environment.appUrl,
			['og:locale']: 'en_US',
			['og:site_name']: 'Draft'
		};

		/** Image absent case */

		const metaOpenGraphImage: string[] = ['og:image', 'og:image:alt', 'og:image:type'];

		// prettier-ignore
		if (metaOpenGraphImage.some((tag: string) => !metaOpenGraph[tag])) {
			metaOpenGraph['og:image'] = environment.appUrl + '/assets/meta.jpg';
			metaOpenGraph['og:image:alt'] = 'Stay up to date with the latest posts and insights from Draft';
			metaOpenGraph['og:image:type'] = 'image/svg';
		}

		Object.keys(metaOpenGraph).forEach((key: string) => {
			const metaDefinition: MetaDefinition = {
				property: key,
				content: metaOpenGraph[key]
			};

			if (key === 'og:description') {
				metaDefinition.name = 'description';
			}

			if (key === 'og:title') {
				metaDefinition.name = 'title';
			}

			this.meta.addTag(metaDefinition);
		});
	}

	removeMetaOpenGraph(metaOpenGraph: MetaOpenGraph): void {
		Object.keys(metaOpenGraph).forEach((key: string) => {
			this.meta.removeTag("property='" + key + "'");
		});
	}

	/** Twitter */

	getMetaTwitter(): MetaTwitter {
		const metaTags: Partial<MetaOpenGraph | MetaTwitter> = {};

		['twitter'].forEach((selector: string) => {
			const metaElement: HTMLMetaElement[] = this.meta.getTags("name^='" + selector + ":'");

			metaElement.forEach((metaElement: HTMLMetaElement) => {
				metaTags[metaElement.getAttribute('name')] = metaElement.content;
			});
		});

		return metaTags as MetaTwitter;
	}

	setMetaTwitter(metaTwitter: MetaTwitter): void {
		/** Clear all meta before setting */

		this.removeMetaTwitter(this.getMetaTwitter());

		/** Set new meta */

		const url: URL = new URL(environment.appUrl);

		metaTwitter = {
			...metaTwitter,
			['twitter:card']: 'summary',
			['twitter:domain']: url.host,
			['twitter:url']: environment.appUrl
		};

		/** Image absent case */

		const metaTwitterImage: string[] = ['twitter:image', 'twitter:image:alt'];

		// prettier-ignore
		if (metaTwitterImage.some((tag: string) => !metaTwitter[tag])) {
			metaTwitterImage['twitter:image'] = environment.appUrl + '/assets/meta.jpg';
			metaTwitterImage['twitter:image:alt'] = 'Stay up to date with the latest posts and insights from Draft';
		}

		Object.keys(metaTwitter).forEach((key: string) => {
			const metaDefinition: MetaDefinition = {
				name: key,
				content: metaTwitter[key]
			};

			if (key === 'twitter:domain') {
				metaDefinition.property = key;
			}

			if (key === 'twitter:url') {
				metaDefinition.property = key;
			}

			this.meta.addTag(metaDefinition);
		});
	}

	removeMetaTwitter(metaTwitter: MetaTwitter): void {
		Object.keys(metaTwitter).forEach((key: string) => {
			this.meta.removeTag("name='" + key + "'");
		});
	}
}
