/** @format */

import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private meta: Meta, private title: Title) {
    this.title.setTitle('Draftnow - Home');

    this.meta.addTag({ name: 'title', content: 'my home title' });
    this.meta.addTag({ name: 'description', content: 'my home description' });
  }
}
