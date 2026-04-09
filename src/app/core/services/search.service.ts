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

    open() { 
        this.isOpen.set(true); 
    }
    close() { 
        this.isOpen.set(false);
        this.query.set('');
    }
}