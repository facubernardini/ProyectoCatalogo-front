import { Component, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "@shared/components/icon";
import { MenuLateralService } from '@shared/services/menu-lateral.service';
import { InfoService } from '@shared/services/info.service';
import { MapDialogService } from '@shared/services/map.service';
import { CategoryViewService } from '@shared/services/category-view.service';
import { ProductosDestacadosService } from '@shared/services/productos-destacados.service';
import { ProductosOfertasService } from '@shared/services/productos-ofertas.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-lateral',
  imports: [Icon, CommonModule],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css',
})
export class MenuLateral {
  private router = inject(Router);
  private categoryViewService = inject(CategoryViewService);
  private productosDestacadosService = inject(ProductosDestacadosService);
  public productosOfertasService = inject(ProductosOfertasService);

  public adminStore = inject(AdminStoreService);
  public menuService = inject(MenuLateralService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  
  catalogo = this.adminStore.catalogo;
  categorias = this.adminStore.categorias;

  categoriasOrdenadas = computed(() => {
    const lista = this.categorias();
    
    const ordenadas = [...lista].sort((a, b) => {
      if (a.especial && !b.especial) return -1;
      if (!a.especial && b.especial) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    const opcionTodos: any = {
      id: -1,
      nombre: 'Ver todos los productos',
      especial: false
    };

    return [opcionTodos, ...ordenadas];
  });

  selected = computed(() => this.menuService.categoriaSeleccionada());

  tieneDestacados = computed(() => {
    return this.adminStore.productos().some(producto => producto.destacado);
  });

  tieneOfertas = computed(() => {
    return this.adminStore.productos().some(producto => 
      producto.presentaciones?.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    );
  });

  seleccionarYFechar(nombre: string) {
    this.menuService.close(); 

    if (this.adminStore.esIndumentaria()) {
      if (nombre === 'Ver todos los productos') {
        this.router.navigate(['/productos']);
      } else {
        const slug = this.crearSlug(nombre);
        this.router.navigate(['/', slug]);
      }
    } else {
      this.categoryViewService.open(nombre);
    }
  }

  abrirDestacados(){
    this.menuService.close();
    if (this.adminStore.esIndumentaria()) {
      this.router.navigate(['/destacados']);
    } else {
      this.productosDestacadosService.open();
    }
  }

  abrirOfertas(){
    this.menuService.close();
    if (this.adminStore.esIndumentaria()) {
      this.router.navigate(['/ofertas']);
    } else {
      this.productosOfertasService.open();
    }
  }

  abrirWhatsapp(): void {
    const numero = this.catalogo()?.wpp_numero;
    if (!numero) {
      console.warn('No hay número de WhatsApp configurado.');
      return;
    }
    
    const url = `https://wa.me/+549${numero}`;
    
    window.open(url, '_blank');
  }

  abrirInstagram(): void {
    const usuario = this.catalogo()?.instagram_usuario;
    if (!usuario) {
      console.warn('No hay usuario de Instagram configurado.');
      return;
    }

    const url = `https://instagram.com/${usuario}`;
    
    window.open(url, '_blank');
  }

  irAlInicio() {
    this.menuService.close();
    this.router.navigate(['/']);
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
