/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';

dayjs.extend(relativeTime);

@Pipe({
	standalone: true,
	name: 'dayjs'
})
export class DayjsPipe implements PipeTransform {
	transform(value: string, type: string, options?: string): string {
		switch (type) {
			case 'fromX':
				return dayjs(value).from(dayjs());
			case 'format':
				return dayjs(value).format(options);
			default:
				throw new Error('Invalid action specified: ' + type);
		}
	}
}
