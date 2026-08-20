import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HistorialSuscripcionesService } from '@shared/services/historial-suscripciones.service';
import { Icon } from "@shared/components/icon";
import { SuscripcionAccion } from '../../enums/suscripcion.enum';

@Component({
  selector: 'app-historial-suscripciones',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './historial-suscripciones.html',
  styleUrl: './historial-suscripciones.css',
})
export class HistorialSuscripciones {
  modalService = inject(HistorialSuscripcionesService);

  AccionEnum = SuscripcionAccion;
}