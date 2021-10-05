/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../../core';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
  createForm: FormGroup;
  createFormIsSubmitting: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private helperService: HelperService
  ) {
    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      private: [false]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSubmit(): void {
    if (this.helperService.getFormValidation(this.createForm)) {
      console.log('all good!');
    }
  }

  onClose(): void {
    this.router
      .navigate(['.'], { relativeTo: this.route.parent, queryParamsHandling: 'preserve' })
      .then(() => this.createForm.reset());
  }
}
