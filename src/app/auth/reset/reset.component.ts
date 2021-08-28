/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelperService, UserService } from '../../core';

@Component({
  selector: 'app-auth-reset',
  templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  resetForm$: Subscription;

  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.resetForm)) {
      this.isSubmitting = true;
    }
  }
}
