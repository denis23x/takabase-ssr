/** @format */

import fs from 'fs';
import xmlbuilder from 'xmlbuilder';
import type { XMLElement } from 'xmlbuilder';

// Create the root element 'sitemapindex' with the required namespace attribute
const sitemap: XMLElement = xmlbuilder
	.create('sitemapindex', { encoding: 'UTF-8' })
	.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

// List of sitemap URLs to be included in the sitemap index
const sitemapList: string[] = [
	'https://takabase.com/assets/sitemaps/sitemap.xml',
	'https://takabase.com/assets/sitemaps/sitemap-authorization.xml',
	'https://takabase.com/assets/sitemaps/sitemap-category.xml',
	'https://takabase.com/assets/sitemaps/sitemap-help.xml',
	'https://takabase.com/assets/sitemaps/sitemap-post.xml',
	'https://takabase.com/assets/sitemaps/sitemap-search.xml',
	'https://takabase.com/assets/sitemaps/sitemap-terms.xml',
	'https://takabase.com/assets/sitemaps/sitemap-user.xml'
];

// Iterate over each URL in the sitemapList array
sitemapList.forEach((url: string) => {
	const sitemapElement: XMLElement = sitemap.ele('sitemap');

	sitemapElement.ele('loc', url);
	sitemapElement.ele('lastmod', new Date().toISOString());
});

// Convert the XML object to a string with pretty printing
const xml: string = sitemap.end({
	pretty: true
});

// Write the XML string to a file
fs.writeFileSync('src/sitemap.xml', xml);
