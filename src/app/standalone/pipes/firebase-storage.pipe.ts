/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../../core/services/helper.service';

@Pipe({
	standalone: true,
	name: 'firebaseStorage'
})
export class FirebaseStoragePipe implements PipeTransform {
	private readonly helperService: HelperService = inject(HelperService);

	transform(value: string): string {
		return this.helperService.getImageURLQueryParams(value);
	}
}
