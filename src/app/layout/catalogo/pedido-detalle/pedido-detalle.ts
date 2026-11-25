import { CommonModule } from '@angular/common';
import { Component, computed, DOCUMENT, effect, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoDetalleDTO } from 'src/app/core/models/pedido.model';
import { PedidosServiceBackend } from 'src/app/core/services-backend/pedidos.ServiceBackend';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { DeliveredType } from 'src/app/shared/enums/correo-argentino.enum';
import { MetodoEntrega } from 'src/app/shared/enums/metodo-entrega.enum';
import { getContrastColor } from 'src/app/shared/utils/obtener-color-contraste.util';
import { obtenerSlugDesdeSubdominio } from 'src/app/shared/utils/obtener-subdominio.util';

@Component({
  selector: 'app-pedido-detalle',
  imports: [CommonModule],
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.css',
})
export class PedidoDetalle implements OnInit, OnDestroy {
  public adminStore = inject(AdminStoreService);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  private route = inject(ActivatedRoute);
  private pedidosBackend = inject(PedidosServiceBackend);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly MetodoEntrega = MetodoEntrega;
  readonly DeliveredType = DeliveredType;

  catalogo = this.adminStore.catalogo;

  pedido = signal<PedidoDetalleDTO | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  whatsappUrl = signal<string | null>(history.state?.whatsappUrl ?? null);

  esCorreoArg = computed(() => this.pedido()?.metodo_entrega === MetodoEntrega.ENVIO_CORREO_ARG);

  constructor() {
    effect(() => {
      const faviconElement = this.document.getElementById('app-favicon') as HTMLLinkElement;
      const catalogo = this.adminStore.catalogo();
      const root = this.document.documentElement;

      if (catalogo) {
        if (catalogo.color_personalizado) {
          const hex = catalogo.color_personalizado;
          
          root.removeAttribute('data-theme');
          
          root.style.setProperty('--theme-accent', hex);
          
          root.style.setProperty('--theme-accent-contrast', getContrastColor(hex));

          root.style.setProperty('--theme-bg', `color-mix(in srgb, ${hex} 5%, #F8FAFC)`);

          root.style.setProperty('--theme-text', `color-mix(in srgb, ${hex} 20%, #0F172A)`);
          root.style.setProperty('--theme-text-sec', `color-mix(in srgb, ${hex} 15%, #475569)`);

        } else {
          const tema = catalogo.tema?.toLowerCase() ?? 'midnight';
          root.setAttribute('data-theme', tema);
          
          root.style.removeProperty('--theme-accent');
          root.style.removeProperty('--theme-accent-contrast');
          root.style.removeProperty('--theme-bg');
          root.style.removeProperty('--theme-text');
          root.style.removeProperty('--theme-text-sec');
        }

        // Título y favicon
        if (catalogo?.nombre_tienda) {
          this.titleService.setTitle(`Listalo - Compra #${this.pedido()?.numero_pedido}`);
        } else {
          this.titleService.setTitle('Listalo - Creá tu tienda online');
        }

        if (catalogo?.logo_tienda && faviconElement) {
          faviconElement.href = catalogo.logo_tienda;
        }
      }
    });
  }

  ngOnInit() {
    if (!this.catalogo()) {
      const slug = obtenerSlugDesdeSubdominio();
      if (slug) {
        this.adminStore.cargarSoloCatalogo(slug);
      }
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Pedido inválido.');
      this.cargando.set(false);
      return;
    }

    this.pedidosBackend.obtenerPedidoPublico(id).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'No encontramos este pedido.');
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'tema-catalogo');
  }

  copiarTexto(valor: string | null | undefined, etiqueta: string) {
    if (!valor) return;
    navigator.clipboard.writeText(valor);
    this.toast.show(`${etiqueta} copiado`, 'success');
  }

  volver() {
    this.router.navigate(['/']);
  }
}
