/** @format */

export interface MetaOpenGraph {
	['og:title']: string;
	['og:description']: string;
	['og:type']: string;
	['profile:username']?: string;
	['article:published_time']?: string;
	['article:modified_time']?: string;
	['article:author']?: string;
	['article:section']?: string;
	['og:url']?: string;
	['og:locale']?: string;
	['og:image']?: string;
	['og:image:alt']?: string;
	['og:image:type']?: string;
	['og:site_name']?: string;
}

export interface MetaTwitter {
	['twitter:card']?: string;
	['twitter:title']: string;
	['twitter:description']: string;
	['twitter:domain']?: string;
	['twitter:url']?: string;
	['twitter:image']?: string;
	['twitter:image:alt']?: string;
}
