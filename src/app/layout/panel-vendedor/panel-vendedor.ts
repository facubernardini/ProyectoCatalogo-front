import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductForm } from "@shared/dialogs/product-form/product-form";
import { Toast } from "@shared/toast/toast";
import { CategoryForm } from "@shared/dialogs/category-form/category-form";

@Component({
  selector: 'app-panel-vendedor',
  imports: [RouterOutlet, ProductForm, Toast, CategoryForm],
  templateUrl: './panel-vendedor.html',
  styleUrl: './panel-vendedor.css',
})
export class PanelVendedor {
  private adminStore = inject(AdminStoreService);

  ngOnInit() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      const { catalogo } = JSON.parse(data);
      if (catalogo?.id) {
        this.adminStore.cargarDatosPanel(catalogo.id);
      }
    }
  }
}
