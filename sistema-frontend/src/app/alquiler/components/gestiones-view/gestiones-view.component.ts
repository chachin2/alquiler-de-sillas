import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Articulo } from '../../../models/articulo.model';
import { Alquiler } from '../../../models/alquiler.model';
import { InventarioService } from '../../../services/inventario.service';

@Component({
  selector: 'app-gestiones-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestiones-view.component.html',
  styleUrls: ['./gestiones-view.component.css']
})
export class GestionesViewComponent {
  @Input() inventario: Articulo[] = [];
  @Input() agenda: Alquiler[] = [];
  @Input() cargando: boolean = false;
  @Input() enviando: boolean = false;

  @Output() agregarAlquiler = new EventEmitter<Alquiler>();
  @Output() entregar = new EventEmitter<Alquiler>();
  @Output() devolver = new EventEmitter<Alquiler>();
  @Output() recibo = new EventEmitter<Alquiler>();
  @Output() cancelarAlquiler = new EventEmitter<Alquiler>();

  nuevoAlquiler: Alquiler = { articuloId: 0, cliente: '', cantidadAlquilada: 0, fechaInicio: '', fechaVencimiento: '', estado: 'RESERVADO' };

  constructor(private inventarioService: InventarioService) {}

  onSubmit() {
    this.agregarAlquiler.emit({ ...this.nuevoAlquiler });
    this.nuevoAlquiler = { articuloId: 0, cliente: '', cantidadAlquilada: 0, fechaInicio: '', fechaVencimiento: '', estado: 'RESERVADO' };
  }

  obtenerDisponible(articuloId: number): number {
    return this.inventarioService.obtenerDisponible(articuloId, this.inventario, this.agenda);
  }

  obtenerPorcentajeOcupado(articuloId: number): number {
    return this.inventarioService.obtenerPorcentajeOcupado(articuloId, this.inventario, this.agenda);
  }

  getNombreArticulo(id: number): string {
    return this.inventarioService.getNombreArticulo(id, this.inventario);
  }
}
