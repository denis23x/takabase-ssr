/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FileService } from '../../core/services/file.service';
import { FileGetOneDto } from '../../core/dto/file/file-get-one.dto';
import { HelperService } from '../../core/services/helper.service';

@Pipe({
	standalone: true,
	name: 'imageTemp'
})
export class ImageTempPipe implements PipeTransform {
	imageSrc$: BehaviorSubject<any> = new BehaviorSubject('');

	constructor(
		private fileService: FileService,
		private helperService: HelperService
	) {}

	transform(value: string): BehaviorSubject<any> {
		if (this.helperService.getIsUrl(value)) {
			this.imageSrc$.next(value);
		} else {
			const fileGetOneDto: FileGetOneDto = {
				filename: value
			};

			this.fileService.getOne(fileGetOneDto).subscribe((blob: Blob) => {
				const fileReader: FileReader = new FileReader();

				fileReader.onload = (event: ProgressEvent<FileReader>) => {
					this.imageSrc$.next(event.target.result);
				};

				fileReader.readAsDataURL(blob);
			});
		}

		return this.imageSrc$;
	}
}
