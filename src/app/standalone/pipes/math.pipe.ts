/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	standalone: true,
	name: 'math'
})
export class MathPipe implements PipeTransform {
	transform(value: number, type: string): number {
		switch (type) {
			case 'abs':
				return Math.abs(value);
			default:
				throw new Error('Invalid type specified: ' + type);
		}
	}
}
