import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CategoriaVendedor } from 'src/app/core/models/categoriaVendedor.model';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { ExploradorProductosService } from 'src/app/shared/services/explorador-productos.service';
import { InfoService } from 'src/app/shared/services/info.service';
import { MapDialogService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-menu-lateral-desktop',
  imports: [Icon, CommonModule],
  templateUrl: './menu-lateral-desktop.html',
  styleUrl: './menu-lateral-desktop.css',
})
export class MenuLateralDesktop {
  public adminStore = inject(AdminStoreService);
  public infoService = inject(InfoService);
  public mapDialogService = inject(MapDialogService);
  public exploradorProductosService = inject(ExploradorProductosService);

  catalogo = this.adminStore.catalogo;
  categorias = this.adminStore.categorias;

  categoriaActiva = signal<CategoriaVendedor | null>(null);
  selected = computed(() => this.exploradorProductosService.categoriaSeleccionada()?.nombre);

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

  seleccionarYFechar(nombre: string) {
    if (nombre === 'Ver todos los productos') {
      this.exploradorProductosService.verCategoria({ nombre: 'Ver todos los productos', es_agrupadora: false });
      return;
    }

    // Buscamos la categoría completa
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

      this.exploradorProductosService.verCategoria(data);
    }
  }

  abrirDestacados(){
    this.exploradorProductosService.verDestacados();
  }

  abrirOfertas(){
    this.exploradorProductosService.verTodasLasOfertas();
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
}