/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import type { Observable } from 'rxjs';
import type { Snack } from '../../../core/models/snack.model';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
	selector: 'app-snackbar, [appSnackbar]',
	templateUrl: './snackbar.component.html'
})
export class SnackbarComponent implements OnInit {
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	snackbarList$: Observable<Snack[]>;

	ngOnInit(): void {
		this.snackbarList$ = this.snackbarService.snackbarList$;
	}

	onClose(snack: Snack): void {
		this.snackbarService.removeSnack(snack);
	}
}
