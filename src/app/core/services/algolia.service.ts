/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch/lite';

@Injectable({
	providedIn: 'root'
})
export class AlgoliaService {
	searchClient: SearchClient | undefined;

	getSearchClient(): SearchClient {
		return (this.searchClient = algoliasearch(environment.algolia.appId, environment.algolia.apiKey));
	}

	getSearchIndex(index: string): SearchIndex {
		return this.getSearchClient().initIndex(index);
	}
}
