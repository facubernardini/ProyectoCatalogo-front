import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { Icon } from "src/app/shared/components/icon";
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { APP_CONFIG } from 'src/app/shared/constants/app.constants';

@Component({
  selector: 'app-estadisticas',
  imports: [Icon, CommonModule, NgxChartsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  public adminStore = inject(AdminStoreService);

  public mostrarBeneficios = signal(true);
  public isDropdownMesOpen = signal(false);

  public metricaEvolucion = signal<'ganancias' | 'ventas'>('ganancias');

  public opcionesMeses: { valor: number, anio: number, label: string }[] = [];

  private isScrolling = false;

  readonly mesesAnteriores = APP_CONFIG.MESES_ANTERIORES_ESTADISTICAS;

  public esMesActual = computed(() => {
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    return this.adminStore.mesEstadisticas() === mesActual && 
           this.adminStore.anioEstadisticas() === anioActual;
  });

  datosGrafico = computed(() => {
    const metrica = this.metricaEvolucion();
    const datos = this.adminStore.evolucionDiaria();

    if (!datos) return [];

    return datos.map(d => {
      // Leemos la ganancia de extra si ya existe, sino usamos el value original
      const ganancia = d.extra?.gananciaReal ?? d.value;

      return {
        name: d.name,
        value: metrica === 'ganancias' ? ganancia : (d.extra?.cantidadVentas || 0),
        extra: {
          ...d.extra,
          gananciaReal: ganancia // <-- ¡Guardado en el bolsillo seguro!
        }
      };
    });
  });

  fechasEjeX = computed(() => {
    const datos = this.adminStore.evolucionDiaria();
    
    if (!datos || datos.length === 0) return [];

    const ultimoIndice = datos.length - 1;

    return datos
      .filter((_, index) => {
        const esUltimoDia = index === ultimoIndice;
        const esMultiploDe5 = index % 5 === 0;

        // Truco visual: Si es múltiplo de 5 pero está muy pegado al último día (a 1 o 2 días),
        // lo ocultamos para que los textos no se encimen y el último día respire.
        if (esMultiploDe5 && !esUltimoDia && (ultimoIndice - index <= 2)) {
          return false;
        }

        // Devolvemos el día si es múltiplo de 5 o si es exactamente el último día
        return esMultiploDe5 || esUltimoDia;
      })
      .map(item => item.name);
  });

  ticksEjeY = computed(() => {
    const datos = this.datosGrafico(); // Leemos de los datos dinámicos, no de la store directa
    if (!datos || datos.length === 0) return [0];

    const maximo = Math.max(...datos.map(d => d.value));

    // LÓGICA PARA VENTAS (Números enteros y chicos)
    if (this.metricaEvolucion() === 'ventas') {
      if (maximo === 0) return [0, 1, 2, 3, 4]; // Escala por defecto
      if (maximo < 4) return Array.from({length: maximo + 1}, (_, i) => i); // Si vendió 2, mostramos saltos de a 1

      // Redondeamos para que los saltos sean parejos (ej: 4, 8, 12)
      const techoVentas = Math.ceil(maximo / 4) * 4;
      return [0, techoVentas * 0.25, techoVentas * 0.50, techoVentas * 0.75, techoVentas];
    }

    // LÓGICA PARA GANANCIAS (Pesos grandes - Tu código original)
    if (maximo === 0) return [0, 25000, 50000, 75000, 100000];
    
    const factor = Math.pow(10, Math.floor(Math.log10(maximo))); 
    const techo = Math.ceil(maximo / factor) * factor;

    return [ 0, techo * 0.25, techo * 0.50, techo * 0.75, techo ];
  });

  public colorScheme: any = {
    domain: ['#4F46E5']
  };

  cambiarMes(opcion: { valor: number, anio: number }) {
    this.adminStore.cargarEstadisticasVendedor(opcion.valor, opcion.anio);
    this.isDropdownMesOpen.set(false);
  }

  obtenerMesSeleccionadoLabel(): string {
    const mes = this.adminStore.mesEstadisticas();
    const anio = this.adminStore.anioEstadisticas();
    const opcion = this.opcionesMeses.find(o => o.valor === mes && o.anio === anio);
    return opcion ? opcion.label : 'Mes actual';
  }

  formatearEjeY = (valor: number): string => {
    if (this.metricaEvolucion() === 'ventas') {
      return valor.toString(); // Las ventas son solo el número
    }

    // Tu formateo original para los pesos
    if (valor === 0) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(valor);
  }

  ngOnInit() {
    this.generarMesesPrevios(this.mesesAnteriores);
    this.adminStore.cargarEstadisticasVendedor();
    window.addEventListener('scroll', this.onScroll, true);
  }

  private generarMesesPrevios(cantidad: number) {
    const hoy = new Date();
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    for (let i = 0; i < cantidad; i++) {
      // Al restarle 'i' al mes, JS automáticamente maneja los saltos de año hacia atrás
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      
      this.opcionesMeses.push({
        valor: fecha.getMonth() + 1,
        anio: fecha.getFullYear(),
        label: `${nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`
      });
    }
  }

  onScroll = () => {
    // 1. Cerramos el dropdown de meses si estaba abierto
    if (this.isDropdownMesOpen()) {
      this.isDropdownMesOpen.set(false);
    }

    // 2. Optimizador de rendimiento: Evita que el código se ejecute cientos de veces por segundo
    if (!this.isScrolling) {
      this.isScrolling = true;

      // 3. LA MAGIA: Buscamos específicamente las barras (etiquetas <g> del SVG)
      // y les enviamos el evento para que la librería reinicie su memoria interna.
      const barras = document.querySelectorAll('ngx-charts-bar-vertical g');
      barras.forEach(barra => {
        barra.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });

      // 4. Ocultamos el tooltip del DOM
      document.body.click();

      // Liberamos el freno después de 200ms
      setTimeout(() => {
        this.isScrolling = false;
      }, 200);
    }
  }

  toggleBeneficios() {
    this.mostrarBeneficios.set(!this.mostrarBeneficios());
  }
}
