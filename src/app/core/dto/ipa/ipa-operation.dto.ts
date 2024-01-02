/** @format */

export interface IPAOperation {
	operation: string;
	source?: string;
	type?: string;
	format?: string;
	[key: string]: string | number | boolean;
}
