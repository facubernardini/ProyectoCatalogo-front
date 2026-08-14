import { inject, Injectable, signal } from '@angular/core';
import { ProductoImportado } from 'src/app/core/models/carga-inicial.model';
import { ToastService } from 'src/app/core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ProductImportPreviewService {
  private toastService = inject(ToastService);

  public isOpen = signal(false);
  public productDuplicate = signal<ProductoImportado | null>(null); 
  
  private originalProductRef: ProductoImportado | null = null; 
  private onSaveCallback: ((original: ProductoImportado, actualizado: ProductoImportado) => void) | null = null;


  open(
    productToEdit: ProductoImportado, 
    onSave: (original: ProductoImportado, actualizado: ProductoImportado) => void
  ) {
    this.originalProductRef = productToEdit;
    this.productDuplicate.set(JSON.parse(JSON.stringify(productToEdit))); 
    
    this.onSaveCallback = onSave;
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    this.productDuplicate.set(null);
    this.originalProductRef = null;
    this.onSaveCallback = null;
    document.body.style.overflow = '';
  }

  saveChanges() {
    const editedData = this.productDuplicate();
    if (this.onSaveCallback && editedData && this.originalProductRef) {
      this.onSaveCallback(this.originalProductRef, editedData);
    }
    this.toastService.show(`Producto "${this.originalProductRef?.nombre}" actualizado`, 'success');
    this.close();
  }
}