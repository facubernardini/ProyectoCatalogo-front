import { Injectable, signal, effect, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ExploradorProductosService } from './explorador-productos.service';

@Injectable({ providedIn: 'root' })
export class SearchDesktopService {
  private explorador = inject(ExploradorProductosService);

  query = signal('');

  debouncedQuery = toSignal(
    toObservable(this.query).pipe(
      debounceTime(350), 
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      const termino = this.debouncedQuery();
      this.explorador.buscar(termino);
    });
  }

  actualizarBusqueda(texto: string) {
    this.query.set(texto);
  }

  limpiarBusqueda() {
    this.query.set('');
    this.explorador.limpiarVista();
  }
}