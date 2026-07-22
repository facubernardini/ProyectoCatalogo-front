import { Injectable, signal } from '@angular/core';
import { ProductoImportado } from 'src/app/core/models/carga-masiva.model';

@Injectable({
  providedIn: 'root'
})
export class ProductImportPreviewService {
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
    this.close();
  }
}