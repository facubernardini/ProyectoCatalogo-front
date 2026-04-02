import { Component, inject } from '@angular/core';
import { Icon } from "@shared/components/icon";
import { Location } from '@angular/common';

@Component({
  selector: 'app-perfil',
  imports: [Icon],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private location = inject(Location);

  volverAtras() {
    this.location.back();
  }
}
