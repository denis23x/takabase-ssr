/** @format */

import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { HelperService } from './helper.service';
import type { MetaOpenGraph, MetaTwitter } from '../models/meta.model';
import type { MetaDefinition } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class MetaService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly meta: Meta = inject(Meta);
	private readonly helperService: HelperService = inject(HelperService);

	setCanonicalURL(): void {
		const url: URL = this.helperService.getURL();
		const urlCanonical: HTMLLinkElement = this.document.querySelector("link[rel='canonical']");
		const urlCanonicalHref: string = url.href.replace(url.search, '');

		if (url.pathname.startsWith('/search')) {
			urlCanonical?.setAttribute('href', urlCanonicalHref.replace(url.pathname, '/search'));
		} else {
			urlCanonical?.setAttribute('href', urlCanonicalHref);
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
			const metaElementList: HTMLMetaElement[] = this.meta.getTags("property^='" + selector + ":'");

			metaElementList.forEach((metaElement: HTMLMetaElement) => {
				// @ts-ignore
				metaTags[metaElement.getAttribute('property')] = metaElement.content;
			});
		});

		return metaTags as MetaOpenGraph;
	}

	setMetaOpenGraph(metaOpenGraph: MetaOpenGraph): void {
		const url: URL = this.helperService.getURL();

		/** Clear all meta before setting */

		this.removeMetaOpenGraph(this.getMetaOpenGraph());

		/** Set new meta */

		metaOpenGraph = {
			...metaOpenGraph,
			['og:url']: url.href,
			['og:locale']: 'en_US',
			['og:site_name']: 'Takabase'
		};

		/** Image absent case */

		const metaOpenGraphImage: string[] = ['og:image', 'og:image:alt', 'og:image:type'];

		// @ts-ignore
		if (metaOpenGraphImage.some((tag: string) => !metaOpenGraph[tag])) {
			metaOpenGraph['og:image'] = url.origin + '/assets/images/placeholder-image-meta.png';
			metaOpenGraph['og:image:alt'] = 'Stay up to date with the latest posts and insights from Takabase';
			metaOpenGraph['og:image:type'] = 'image/svg';
		}

		Object.keys(metaOpenGraph).forEach((key: string) => {
			const metaDefinition: MetaDefinition = {
				property: key,
				content: metaOpenGraph[key as keyof MetaOpenGraph]
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
			const metaElementList: HTMLMetaElement[] = this.meta.getTags("name^='" + selector + ":'");

			metaElementList.forEach((metaElement: HTMLMetaElement) => {
				// @ts-ignore
				metaTags[metaElement.getAttribute('name')] = metaElement.content;
			});
		});

		return metaTags as MetaTwitter;
	}

	setMetaTwitter(metaTwitter: MetaTwitter): void {
		const url: URL = this.helperService.getURL();

		/** Clear all meta before setting */

		this.removeMetaTwitter(this.getMetaTwitter());

		/** Set new meta */

		metaTwitter = {
			...metaTwitter,
			['twitter:card']: 'summary',
			['twitter:domain']: url.host,
			['twitter:url']: url.href
		};

		/** Image absent case */

		const metaTwitterImage: string[] = ['twitter:image', 'twitter:image:alt'];

		// @ts-ignore
		if (metaTwitterImage.some((tag: string) => !metaTwitter[tag])) {
			metaTwitter['twitter:image'] = url.origin + '/assets/images/placeholder-image-meta.png';
			metaTwitter['twitter:image:alt'] = 'Stay up to date with the latest posts and insights from Takabase';
		}

		Object.keys(metaTwitter).forEach((key: string) => {
			const metaDefinition: MetaDefinition = {
				name: key,
				content: metaTwitter[key as keyof MetaTwitter]
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
