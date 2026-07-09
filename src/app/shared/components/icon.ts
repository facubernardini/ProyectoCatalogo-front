import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [NgClass],
  template: `
    <svg [ngClass]="classes()">
      <use [attr.href]="'assets/sprites.svg#' + name()"></use>
    </svg>
  `
})
export class Icon {
  name = input.required<string>();
  classes = input<string>('');
}