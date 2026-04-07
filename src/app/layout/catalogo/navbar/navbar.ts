import { Component, input } from '@angular/core';
import { Icon } from "@shared/components/icon";

@Component({
  selector: 'app-navbar',
  imports: [Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  nombreTienda = input.required<string>();
}
