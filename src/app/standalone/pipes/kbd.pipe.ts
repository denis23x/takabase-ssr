/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Pipe({
	standalone: true,
	name: 'kbd'
})
export class KbdPipe implements PipeTransform {
	private readonly platformService: PlatformService = inject(PlatformService);

	transform(value: string): string {
		return this.platformService.getOSKeyboardCharacter(value);
	}
}
