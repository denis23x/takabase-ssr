/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Snack } from '../../../core/models/snack.model';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { Observable } from 'rxjs';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
	selector: 'app-snackbar, [appSnackbar]',
	templateUrl: './snackbar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
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
