import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Catalogo } from "./layout/catalogo/catalogo";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Catalogo],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('proyecto-catalogo');
}
