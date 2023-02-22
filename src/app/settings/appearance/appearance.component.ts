/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { environment } from '../../../environments/environment';

interface AppearanceForm {
	theme: FormControl<string>;
	themeBackground: FormControl<string>;
	themePrism: FormControl<string>;
	language: FormControl<string>;
	monospace: FormControl<boolean>;
	buttons: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, DropdownComponent],
	selector: 'app-settings-appearance',
	templateUrl: './appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	appearanceForm: FormGroup | undefined;
	appearanceForm$: Subscription | undefined;
	appearanceIsSubmitted: boolean | false;

	appearanceThemeList: string[] = environment.themes.sort();
	appearanceBackgroundList: string[] = environment.backgrounds.sort();
	appearancePrismList: string[] = environment.prism.sort();
	appearanceLanguageList: string[] = ['English', 'Italian', 'French'];
	appearanceButtonsList: string[] = ['left', 'right'];

	constructor(
		private formBuilder: FormBuilder,
		private userService: UserService,
		private authService: AuthService,
		private activatedRoute: ActivatedRoute
	) {
		// prettier-ignore
		this.appearanceForm = this.formBuilder.group<AppearanceForm>({
			theme: this.formBuilder.nonNullable.control('', [Validators.required]),
      themeBackground: this.formBuilder.nonNullable.control('', [Validators.required]),
      themePrism: this.formBuilder.nonNullable.control('', [Validators.required]),
      language: this.formBuilder.nonNullable.control('', [Validators.required]),
      monospace: this.formBuilder.control(null, [Validators.required]),
      buttons: this.formBuilder.nonNullable.control('', [Validators.required]),
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent?.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => {
					this.authUser = user;

					this.appearanceForm.patchValue(user.settings);
					this.appearanceForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.appearanceForm$ = this.appearanceForm.valueChanges.subscribe({
			next: (value: any) => {
				this.appearanceIsSubmitted = true;

				const userUpdateDto: UserUpdateDto = {
					settings: value
				};

				this.userService.update(this.authUser.id, userUpdateDto).subscribe({
					next: (user: User) => {
						this.authService.setUser(user);

						this.appearanceIsSubmitted = false;
					},
					error: () => (this.appearanceIsSubmitted = false)
				});
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.appearanceForm$].forEach($ => $?.unsubscribe());
	}
}
