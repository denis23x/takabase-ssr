/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	standalone: true,
	name: 'fireStorage'
})
export class FireStoragePipe implements PipeTransform {
	transform(value: string): string {
		return value + '?alt=media';
	}
}
