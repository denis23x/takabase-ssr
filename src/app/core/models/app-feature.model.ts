/** @format */

export interface AppFeature {
	id: number;
	icon: string;
	title: string;
	description: string;
	descriptionList: AppFeatureDescription[];
}

export interface AppFeatureDescription {
	title: string;
	description: string;
}
