/** @format */

import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';

export interface OpenGraph {
	['og:title']: string;
	['og:description']: string;
	['og:type']: string;
	['og:url']: string;
	['og:locale']: string;
	['og:image']: string;
	['og:image:alt']: string;
	['og:image:type']: string;
	['og:site_name']: string;
}

export interface Twitter {
	['twitter:card']: string;
	['twitter:site']: string;
	['twitter:title']: string;
	['twitter:description']: string;
	['twitter:image']: string;
	['twitter:image:alt']: string;
}

@Injectable({
	providedIn: 'root'
})
export class MetaService {
	constructor(private title: Title, private meta: Meta) {}

	// TODO: add canonical link

	setOpenGraph(openGraph: OpenGraph): void {
		Object.keys(openGraph).forEach((key: string) => {
			// prettier-ignore
			const metaElement: HTMLMetaElement | null = this.meta.getTag("property='" + key + "'");

			const metaDefinition: MetaDefinition = {
				property: key,
				content: openGraph[key]
			};

			// TODO: edd description name attr

			if (metaElement) {
				this.meta.addTag(metaDefinition);
			} else {
				this.meta.updateTag(metaDefinition);
			}
		});
	}

	setTwitter(twitter: Twitter): void {
		Object.keys(twitter).forEach((key: string) => {
			// prettier-ignore
			const metaElement: HTMLMetaElement | null = this.meta.getTag("property='" + key + "'");

			const metaDefinition: MetaDefinition = {
				property: key,
				content: twitter[key]
			};

			if (metaElement) {
				this.meta.addTag(metaDefinition);
			} else {
				this.meta.updateTag(metaDefinition);
			}
		});
	}
}
