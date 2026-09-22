import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from "@shared/components/icon";
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

@Component({
  selector: 'app-hero-indumentaria',
  standalone: true,
  imports: [Icon],
  templateUrl: './hero-indumentaria.html',
})
export class HeroIndumentaria implements AfterViewInit {
  public adminStore = inject(AdminStoreService);
  private router = inject(Router);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  imagenesCargadas = signal<Set<number>>(new Set());
  paginaActual = signal<number>(0);

  paginasDeCategorias = computed(() => {
    const categorias = this.adminStore.categorias();
    const paginas = [];
    for (let i = 0; i < categorias.length; i += 4) {
      paginas.push(categorias.slice(i, i + 4));
    }
    return paginas;
  });

  ngAfterViewInit() {
    // Escuchar el scroll para actualizar los puntitos en mobile
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.addEventListener('scroll', () => {
        const container = this.scrollContainer.nativeElement;
        // Calculamos en qué página estamos basándonos en el scroll horizontal
        const scrollIndex = Math.round(container.scrollLeft / container.clientWidth);
        this.paginaActual.set(scrollIndex);
      }, { passive: true });
    }
  }

  // Método para flechas en Desktop
  irAPagina(index: number) {
    if (!this.scrollContainer?.nativeElement) return;
    
    const totalPaginas = this.paginasDeCategorias().length;
    const targetIndex = Math.max(0, Math.min(index, totalPaginas - 1));
    
    const container = this.scrollContainer.nativeElement;
    container.scrollTo({
      left: targetIndex * container.clientWidth,
      behavior: 'smooth'
    });
    
    this.paginaActual.set(targetIndex);
  }

  seleccionarCategoria(categoria: CategoriaVendedor) {
    const slug = this.crearSlug(categoria.nombre);
    this.router.navigate(['/', slug]);
  }

  onImageLoad(categoriaId: number) {
    this.imagenesCargadas.update(set => {
      const nuevoSet = new Set(set);
      nuevoSet.add(categoriaId);
      return nuevoSet;
    });
  }

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