import { Injectable, signal, computed, inject } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';

type VistaCatalogo = 'home' | 'busqueda' | 'categoria' | 'destacados' | 'ofertas';

@Injectable({ providedIn: 'root' })
export class ExploradorProductosService {
  private adminStore = inject(AdminStoreService);

  vistaActual = signal<VistaCatalogo>('home');
  terminoBusqueda = signal<string>('');
  categoriaSeleccionada = signal<string>('');

  productosFiltrados = computed(() => {
    const todosLosProductos = this.adminStore.productos();
    const vista = this.vistaActual();

    if (vista === 'home') {
      return [];
    }

    if (vista === 'busqueda') {
      const queryOriginal = this.terminoBusqueda().trim();
      if (queryOriginal.length < 2) return [];

      // 1. Limpieza general y Tokenización
      const queryLimpia = queryOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const terminosBusqueda = queryLimpia.split(' ').filter(t => t.length > 0);
      
      // Versión compacta sin espacios
      const queryCompacta = queryLimpia.replace(/\s+/g, "");

      if (terminosBusqueda.length === 0) return [];
      const primerTermino = terminosBusqueda[0];

      // 2. Filtrado base dual
      const filtrados = todosLosProductos.filter(p => {
        const camposUnidos = [p.nombre, p.descripcion, p.marca].filter(Boolean).join(' ');
        const textoProducto = camposUnidos.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const textoProductoCompacto = textoProducto.replace(/\s+/g, "");

        const matchClasico = terminosBusqueda.every(termino => textoProducto.includes(termino));
        const matchCompacto = textoProductoCompacto.includes(queryCompacta);

        return matchClasico || matchCompacto;
      });

      // 3. Sistema de Puntaje (Scoring)
      return filtrados.map(p => {
        const nombre = (p.nombre || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const marca = (p.marca || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const desc = (p.descripcion || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const nombreCompacto = nombre.replace(/\s+/g, "");
        const marcaCompacta = marca.replace(/\s+/g, "");

        let score = 0;

        if (nombre === queryLimpia) {
          score = 100;
        } 
        else if (nombre.startsWith(queryLimpia)) {
          score = 90;
        }
        else if (nombre.includes(queryLimpia)) {
          score = 80;
        }
        else if (nombre.startsWith(primerTermino) && terminosBusqueda.every(t => nombre.includes(t))) {
          score = 70;
        }
        else if (terminosBusqueda.every(t => nombre.includes(t))) {
          score = 60;
        } 
        else if (nombreCompacto.includes(queryCompacta)) {
          score = 55;
        }
        else if (marcaCompacta.includes(queryCompacta)) {
          score = 50; 
        }
        else if (terminosBusqueda.some(t => marca.includes(t))) {
          score = 40;
        } 
        else if (terminosBusqueda.some(t => desc.includes(t))) {
          score = 20;
        } 
        else {
          score = 10;
        }

        return { producto: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.producto);
    }

    if (vista === 'categoria') {
      const categoria = this.categoriaSeleccionada();
      return todosLosProductos.filter(p => 
        p.categorias.some(c => c.nombre === categoria)
      );
    }

    if (vista === 'destacados') {
      return todosLosProductos.filter(p => p.destacado);
    }

    if (vista === 'ofertas') {
      return todosLosProductos.filter(p => 
        p.presentaciones.some(pres => pres.precio_descuento && pres.precio_descuento > 0)
      );
    }

    return [];
  });

  buscar(termino: string) {
    if (!termino.trim()) {
      this.limpiarVista();
      return;
    }
    this.terminoBusqueda.set(termino);
    this.vistaActual.set('busqueda');
  }

  verCategoria(categoria: string) {
    this.categoriaSeleccionada.set(categoria);
    this.vistaActual.set('categoria');
  }

  verDestacados() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set(''); 
    this.vistaActual.set('destacados');
  }

  verTodasLasOfertas() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set(''); 
    this.vistaActual.set('ofertas');
  }

  limpiarVista() {
    this.terminoBusqueda.set('');
    this.categoriaSeleccionada.set('');
    this.vistaActual.set('home');
  }
}