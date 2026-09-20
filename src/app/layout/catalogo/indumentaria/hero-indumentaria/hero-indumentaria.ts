import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-hero-indumentaria',
  standalone: true,
  imports: [Icon],
  templateUrl: './hero-indumentaria.html'
})
export class HeroIndumentaria {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  imagenesCargadas = signal<Set<number>>(new Set());

  seleccionarCategoria(categoria: CategoriaVendedor) {
    // Creamos el slug a partir del nombre (ej: "Buzos Negros" -> "buzos-negros")
    const slug = this.crearSlug(categoria.nombre);
    
    // Navegamos a la ruta que armamos en CatalogoPublico
    this.router.navigate(['/categoria', slug]);
  }

  onImageLoad(categoriaId: number) {
    this.imagenesCargadas.update(set => {
      const nuevoSet = new Set(set);
      nuevoSet.add(categoriaId);
      return nuevoSet;
    });
  }

  // 👇 3. Función auxiliar para consultar el estado en el HTML
  isImageLoaded(categoriaId: number): boolean {
    return this.imagenesCargadas().has(categoriaId);
  }

  private crearSlug(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}