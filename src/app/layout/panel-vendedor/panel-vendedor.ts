import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminStoreService } from 'src/app/core/services/admin-store.service';
import { ProductForm } from "@shared/dialogs/product-form/product-form";
import { Toast } from "src/app/shared/components/toast/toast";
import { CategoryForm } from "@shared/dialogs/category-form/category-form";
import { ConfirmDialog } from "@shared/dialogs/confirm-dialog/confirm-dialog";
import { ProductPreview } from "@shared/dialogs/product-preview/product-preview";
import { CategoryDelete } from "@shared/dialogs/category-delete/category-delete";
import { CuponForm } from "@shared/dialogs/cupon-form/cupon-form";
import { CategoryPreview } from "@shared/dialogs/category-preview/category-preview";
import { LoadingSpinner } from "@shared/components/loading-spinner/loading-spinner";

@Component({
  selector: 'app-panel-vendedor',
  imports: [RouterOutlet, ProductForm, Toast, CategoryForm, ConfirmDialog, ProductPreview, CategoryDelete, CuponForm, CategoryPreview, LoadingSpinner],
  templateUrl: './panel-vendedor.html',
  styleUrl: './panel-vendedor.css',
})
export class PanelVendedor {
  public adminStore = inject(AdminStoreService);

  ngOnInit() {
    const data = localStorage.getItem('vendedor');
    if (data) {
      const vendedor = JSON.parse(data);
      if (vendedor.catalogoId) {
        this.adminStore.cargarDatosPanelVendedor(vendedor.catalogoId);
      }
    }
  }
}
