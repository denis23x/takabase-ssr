/** @format */

export interface IPAOperation {
	operation: string;
	source?: string;
	[key: string]: string | number | boolean;
}
