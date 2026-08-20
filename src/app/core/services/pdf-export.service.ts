import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Producto } from '../models/producto.model';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';
import { Catalogo } from '../models/catalogo.model';
import { BRAND_DATA } from '../data/brand.data';
import { AdminStoreService } from './admin-store.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private adminStore = inject(AdminStoreService);
  private toastService = inject(ToastService);

  async generarPdf() {
    const categorias = this.adminStore.categorias(); 
    const todosLosProductos = this.adminStore.productos();
    const catalogo = this.adminStore.catalogo();

    if (!catalogo) {
      this.toastService.show('Ocurrió un error inesperado al cargar los datos', 'error');
      return;
    }

    if (todosLosProductos.length == 0) {
      this.toastService.show('Crea productos antes de exportar', 'error');
      return;
    }

    const categoriasOrdenadas = [...categorias].sort((a, b) => 
      a.nombre.localeCompare(b.nombre)
    );

    const proceso = this.toastService.loading('Generando PDF...');

    try {
      await this.exportarCatalogo(categoriasOrdenadas, todosLosProductos, catalogo);
      proceso.success('PDF generado con éxito.');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      proceso.error('Hubo un error al generar el PDF.');
    }
  }

  private async exportarCatalogo(categorias: CategoriaVendedor[], productos: Producto[], catalogo: Catalogo) {
    const doc = new jsPDF();
    const nombreTienda = catalogo.nombre_tienda || 'Mi Tienda';
    
    const MARGEN_X = 8; 
    let posicionYActual = 20;

    if (catalogo.logo_tienda) {
      try {
        const imgLogoAplanado = await this.cargarImagenParaPDF(catalogo.logo_tienda);
        doc.addImage(imgLogoAplanado, 'JPEG', MARGEN_X, 10, 25, 25); 
        
        doc.setFontSize(22);
        doc.setTextColor(30, 61, 89);
        doc.text(`Catálogo de Productos`, MARGEN_X + 28, 22); 
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(nombreTienda, MARGEN_X + 28, 30);

        posicionYActual = 45;
      } catch (error) {
        this.dibujarCabeceraTexto(doc, nombreTienda, MARGEN_X);
        posicionYActual = 40;
      }
    } else {
      this.dibujarCabeceraTexto(doc, nombreTienda, MARGEN_X);
      posicionYActual = 40;
    }

    const productosActivos = productos.filter(p => p.activo);

    categorias.forEach(categoria => {
      
      const productosDeCategoria = productosActivos.filter(prod => 
        prod.categorias?.some(c => c.id === categoria.id)
      );

      if (productosDeCategoria.length > 0) {
        
        if (posicionYActual > 250) {
          doc.addPage();
          posicionYActual = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(categoria.nombre.toUpperCase(), MARGEN_X, posicionYActual);
        
        posicionYActual += 5;

        const filasTabla = productosDeCategoria.map(p => {
          
          const presentacionesTexto = p.presentaciones
            .filter(pres => pres.activo)
            .map(pres => {
              let texto = `• ${pres.unidad_venta}: $${pres.precio}`;
              if (pres.precio_descuento) {
                texto += ` (Oferta: $${pres.precio_descuento})`;
              }
              return texto;
            }).join('\n');

          const tagsTexto = p.tags && p.tags.length > 0 
            ? p.tags.map(t => t.nombre).join(', ') 
            : '-';

          const marcaTexto = p.marca ? p.marca : '-';

          return [
            p.nombre,
            marcaTexto,
            presentacionesTexto || 'Sin presentaciones',
            tagsTexto
          ];
        });

        autoTable(doc, {
          startY: posicionYActual,
          head: [['Producto', 'Marca', 'Presentaciones y precios', 'Observaciones']], 
          body: filasTabla,
          theme: 'striped',
          headStyles: { fillColor: [30, 61, 89] },
          styles: { 
            fontSize: 9, 
            cellPadding: 2,
            valign: 'middle',
            minCellHeight: 18
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 25 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 30 }
          },
          margin: { left: MARGEN_X, right: MARGEN_X }
        });

        posicionYActual = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      const texto1 = 'Generado con ';
      const textoLink = 'Listalo';
      const texto2 = ' - Tienda Digital';
      
      const y = doc.internal.pageSize.height - 10;
      const pageWidth = doc.internal.pageSize.width;

      doc.setFont('helvetica', 'normal');
      const ancho1 = doc.getTextWidth(texto1);
      const ancho2 = doc.getTextWidth(texto2);

      doc.setFont('helvetica', 'bold');
      const anchoLink = doc.getTextWidth(textoLink);

      const anchoTotal = ancho1 + anchoLink + ancho2;
      let xActual = (pageWidth - anchoTotal) / 2;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(texto1, xActual, y);
      xActual += ancho1;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 61, 89);
      doc.textWithLink(textoLink, xActual, y, { url: `https://${BRAND_DATA.domain}` });
      xActual += anchoLink;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(texto2, xActual, y);
      
      doc.text(
        `Página ${i} de ${totalPages}`, 
        doc.internal.pageSize.width - MARGEN_X, 
        doc.internal.pageSize.height - 10, 
        { align: 'right' }
      );
    }

    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    doc.save(`Catalogo_${nombreTienda.replace(/\s+/g, '_')}_${fecha}.pdf`);
  }

  private async cargarImagenParaPDF(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; 
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject('Error al crear el Canvas');
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const base64Aplanado = canvas.toDataURL('image/jpeg', 0.9);
        resolve(base64Aplanado);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  private dibujarCabeceraTexto(doc: jsPDF, nombreTienda: string, margenX: number) {
    doc.setFontSize(22);
    doc.setTextColor(30, 61, 89);
    doc.text(`Catálogo de Productos`, margenX, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(nombreTienda, margenX, 28);
  }
}