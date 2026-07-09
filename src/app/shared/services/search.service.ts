import { Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  isOpen = signal(false);
  query = signal('');

  debouncedQuery = toSignal(
    toObservable(this.query).pipe(
      debounceTime(350), 
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  constructor() {
    window.addEventListener('popstate', () => {
      if (this.isOpen() && history.state?.modal !== 'search-modal') {
        this.cerrarInterno();
      }
    });
  }

  open() {
		if (this.isOpen()) return;
    this.isOpen.set(true);

		document.body.style.overflow = 'hidden';

    history.pushState({ modal: 'search-modal' }, '');
  }

  close() { 
    this.cerrarInterno();
    
    if (history.state?.modal === 'search-modal') {
      history.back();
    }
  }

  private cerrarInterno() {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.query.set('');

		document.body.style.overflow = 'auto';
  }
}