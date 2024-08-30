/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs/esm';
import type { OpUnitType, QUnitType } from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';

dayjs.extend(relativeTime);

@Pipe({
	standalone: true,
	name: 'dayjs'
})
export class DayjsPipe implements PipeTransform {
	transform(value: string, type: string, options?: any): string | number {
		switch (type) {
			case 'diff':
				return dayjs().diff(dayjs(value), options as QUnitType | OpUnitType);
			case 'fromNow':
				return dayjs(value).fromNow(options as boolean);
			case 'format':
				return dayjs(value).format(options as string);
			default:
				throw new Error('Invalid type specified: ' + type);
		}
	}
}
