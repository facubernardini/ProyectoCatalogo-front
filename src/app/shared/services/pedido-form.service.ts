import { Injectable, signal } from '@angular/core';
import { MetodoEntrega } from '../enums/metodo-entrega.enum';
import { MedioPago } from '../enums/medio-pago.enum';
import { EstadoPago, EstadoPedido, PedidoFormData } from 'src/app/core/models/pedido.model';

const estadoInicial: PedidoFormData = {
  comprador_nombre: '',
  comprador_direccion: '',
  comprador_telefono: '',
  metodo_entrega: MetodoEntrega.RETIRO, 
  metodo_pago: MedioPago.EFECTIVO, 
  cupon_codigo: '',

  estado: EstadoPedido.ENTREGADO,
  estado_pago: EstadoPago.PAGADO,
  
  productos: []
};

@Injectable({
  providedIn: 'root'
})
export class PedidoFormService {
  isOpen = signal<boolean>(false);
  
  formData = signal<PedidoFormData>(this.getInitialState());

  open() {
    this.resetForm();
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  resetForm() {
    this.formData.set(this.getInitialState());
  }

  private getInitialState(): PedidoFormData {
    return JSON.parse(JSON.stringify(estadoInicial));
  }
}