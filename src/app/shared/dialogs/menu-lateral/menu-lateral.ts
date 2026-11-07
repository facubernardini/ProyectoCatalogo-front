import { Component, computed, inject, signal } from '@angular/core';
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
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';

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

  categoriaActiva = signal<CategoriaVendedor | null>(null);

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

  tieneDestacados = computed(() => {
    return this.adminStore.productos().some(producto => producto.destacado);
  });

  tieneOfertas = computed(() => {
    return this.adminStore.productos().some(producto => 
      producto.presentaciones?.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
    );
  });

  abrirSubmenu(categoria: CategoriaVendedor) {
    if (categoria.es_agrupadora) {
      this.categoriaActiva.set(categoria);
    } else {
      this.seleccionarYFechar(categoria.nombre);
    }
  }

  cerrarSubmenu() {
    this.categoriaActiva.set(null);
  }

  cerrarMenuCompletamente() {
    this.menuService.close();
    setTimeout(() => this.cerrarSubmenu(), 300); 
  }

  seleccionarYFechar(nombre: string) {
    this.cerrarMenuCompletamente(); 

    if (this.adminStore.esIndumentaria()) {
      if (nombre === 'Ver todos los productos') {
        this.router.navigate(['/productos']);
        return;
      }

      // Buscar la categoría completa para saber si es padre o hija
      let catPadre: any = null;
      let esSubcategoria = false;

      for (const cat of this.adminStore.categorias()) {
        if (cat.nombre === nombre) {
          catPadre = cat;
          break;
        }
        if (cat.subcategorias) {
          const hija = cat.subcategorias.find((s: any) => s.nombre === nombre);
          if (hija) {
            catPadre = cat;
            esSubcategoria = true;
            break;
          }
        }
      }

      if (catPadre) {
        if (esSubcategoria) {
          this.router.navigate(['/', this.crearSlug(catPadre.nombre), this.crearSlug(nombre)]);
        } else {
          this.router.navigate(['/', this.crearSlug(catPadre.nombre)]);
        }
      } else {
        this.router.navigate(['/', this.crearSlug(nombre)]);
      }

    } else {
      if (nombre === 'Ver todos los productos') {
        this.categoryViewService.open({ nombre: 'Productos', es_agrupadora: false });
        return;
      }

      let catEncontrada: any = null;
      for (const cat of this.adminStore.categorias()) {
        if (cat.nombre === nombre) {
          catEncontrada = cat;
          break;
        }
        if (cat.subcategorias) {
          const hija = cat.subcategorias.find(s => s.nombre === nombre);
          if (hija) {
            catEncontrada = hija;
            break;
          }
        }
      }

      if (catEncontrada) {
        const data: any = {
          nombre: catEncontrada.nombre,
          es_agrupadora: catEncontrada.es_agrupadora || false
        };

        if (catEncontrada.es_agrupadora && catEncontrada.subcategorias) {
          data.nombres_hijas = catEncontrada.subcategorias.map((s: any) => s.nombre);
        }

        this.categoryViewService.open(data);
      }
    }
  }

  abrirDestacados(){
    this.cerrarMenuCompletamente();
    if (this.adminStore.esIndumentaria()) {
      this.router.navigate(['/destacados']);
    } else {
      this.productosDestacadosService.open();
    }
  }

  abrirOfertas(){
    this.cerrarMenuCompletamente();
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
    this.cerrarMenuCompletamente();
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
