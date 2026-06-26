import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Icon } from 'src/app/shared/components/icon';
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { ProductCardDesktop } from '../lista-productos-desktop/product-card-desktop/product-card-desktop';

@Component({
  selector: 'app-explorador-productos-desktop',
  imports: [CommonModule, ProductCardDesktop, Icon],
  templateUrl: './explorador-productos-desktop.html',
  styleUrl: './explorador-productos-desktop.css',
})
export class ExploradorProductosDesktop {
  public explorador = inject(ExploradorProductosService);
}
