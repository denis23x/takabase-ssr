/** @format */

import { IResult } from 'ua-parser-js';

export interface Session {
	id: number;
	ua: string;
	uaParsed?: IResult;
	fingerprint: string;
	ip: string;
	createdAt: string;
	updatedAt: string;
}
