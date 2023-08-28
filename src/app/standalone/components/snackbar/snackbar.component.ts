/** @format */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Snack } from '../../../core/models/snack.model';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { Observable } from 'rxjs';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
	selector: 'app-snackbar, [appSnackbar]',
	templateUrl: './snackbar.component.html'
})
export class SnackbarComponent implements OnInit {
	snackbarList$: Observable<Snack[]>;

	constructor(private snackbarService: SnackbarService) {}

	ngOnInit(): void {
		this.snackbarList$ = this.snackbarService.snackbarList$;
	}

	onClose(snack: Snack): void {
		this.snackbarService.removeSnack(snack);
	}
}
