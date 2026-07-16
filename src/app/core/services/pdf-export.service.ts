import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Producto } from '../models/producto.model';
import { CategoriaVendedor } from '../models/categoriaVendedor.model';
import { Catalogo } from '../models/catalogo.model';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  async exportarCatalogo(categorias: CategoriaVendedor[], productos: Producto[], catalogo: Catalogo) {
    const doc = new jsPDF();
    const nombreTienda = catalogo.nombre_tienda || 'Mi Tienda';
    
    let posicionYActual = 20;

    if (catalogo.logo_tienda) {
      try {
        const imgLogoAplanado = await this.cargarImagenParaPDF(catalogo.logo_tienda);
        
        doc.addImage(imgLogoAplanado, 'JPEG', 14, 10, 25, 25); 
        
        doc.setFontSize(22);
        doc.setTextColor(30, 61, 89);
        doc.text(`Catálogo de Productos`, 45, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(nombreTienda, 45, 30);

        posicionYActual = 45;
      } catch (error) {
        console.warn('No se pudo cargar el logo para el PDF', error);
        this.dibujarCabeceraTexto(doc, nombreTienda);
        posicionYActual = 40;
      }
    }

    const productosActivos = productos.filter(p => p.activo);

    categorias.forEach(categoria => {
      
      const productosDeCategoria = productosActivos.filter(prod => 
        prod.categorias?.some(c => c.id === categoria.id)
      );

      if (productosDeCategoria.length > 0) {
        
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(categoria.nombre.toUpperCase(), 14, posicionYActual);
        
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

          return [
            p.nombre, 
            presentacionesTexto || 'Sin presentaciones',
            tagsTexto
          ];
        });

        autoTable(doc, {
          startY: posicionYActual,
          head: [['Producto', 'Presentaciones y precios', 'Observaciones']], 
          body: filasTabla,
          theme: 'striped',
          headStyles: { fillColor: [30, 61, 89] },
          styles: { 
            fontSize: 9, 
            cellPadding: 4,
            valign: 'middle'
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 40 }
          },
          margin: { left: 14, right: 14 }
        });

        posicionYActual = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    doc.save(`Catalogo_${nombreTienda.replace(/\s+/g, '_')}_${fecha}.pdf`);
  }

  // Método auxiliar para cargar la imagen antes de meterla al PDF
  async cargarImagenParaPDF(url: string): Promise<string> {
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

  private dibujarCabeceraTexto(doc: jsPDF, nombreTienda: string) {
    doc.setFontSize(22);
    doc.setTextColor(30, 61, 89);
    doc.text(`Catálogo de Productos`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(nombreTienda, 14, 28);
  }
}