/** @format */

export interface Insight {
	id: number;
	key: string;
	value: string;
	countPreceding: number;
	countFollowing: number;
	changeState: string;
	changePercent: number;
}
