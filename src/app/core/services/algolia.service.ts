/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import algoliasearch from 'algoliasearch/lite';
import type { SearchClient, SearchIndex } from 'algoliasearch/lite';

@Injectable()
export class AlgoliaService {
	searchClient: SearchClient | undefined;

	getSearchClient(): SearchClient {
		return (this.searchClient = algoliasearch(environment.algolia.appId, environment.algolia.apiKey));
	}

	getSearchIndex(index: string): SearchIndex {
		return this.getSearchClient().initIndex(index);
	}
}
