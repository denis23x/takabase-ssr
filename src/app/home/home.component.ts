/** @format */

import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SnackbarService } from '../core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private meta: Meta, private title: Title, private snackbarService: SnackbarService) {
    this.title.setTitle('Draftnow - Home');

    this.meta.addTag({ name: 'title', content: 'my home title' });
    this.meta.addTag({ name: 'description', content: 'my home description' });
  }

  onClick(): void {
    this.snackbarService.info(
      'Here is a service where you can public and share of your posts (or drafts), like new good looking design, useful tip or some guide with code snippets info',
      {
        duration: 30000
      }
    );
    this.snackbarService.success(
      'Here is a service where you can public and share of your posts (or drafts), like new good looking design, useful tip or some guide with code snippets success',
      {
        duration: 30000
      }
    );
    this.snackbarService.warning(
      'Here is a service where you can public and share of your posts (or drafts), like new good looking design, useful tip or some guide with code snippets warning',
      {
        duration: 30000
      }
    );
    this.snackbarService.danger(
      'Here is a service where you can public and share of your posts (or drafts), like new good looking design, useful tip or some guide with code snippets danger',
      {
        duration: 30000
      }
    );
  }
}
