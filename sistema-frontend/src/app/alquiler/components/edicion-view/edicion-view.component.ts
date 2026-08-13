import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Articulo } from '../../../models/articulo.model';
import { Alquiler } from '../../../models/alquiler.model';

@Component({
  selector: 'app-edicion-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicion-view.component.html',
  styleUrls: ['./edicion-view.component.css']
})
export class EdicionViewComponent implements OnInit {
  @Input() inventario: Articulo[] = [];
  @Input() agenda: Alquiler[] = [];
  @Input() enviando: boolean = false;

  @Output() actualizarArticulo = new EventEmitter<Articulo>();
  @Output() actualizarAlquiler = new EventEmitter<Alquiler>();
  @Output() eliminarArticulo = new EventEmitter<number>();

  tipoEdicion: 'ARTICULO' | 'ALQUILER' = 'ARTICULO';

  // State for Article Edition
  articuloSeleccionadoId: number | null = null;
  articuloEditable: Articulo = { nombre: '', cantidadTotal: 0, tarifa: 0, tipoTarifa: 'DIA', fotoUrl: '' };

  // State for Rental Edition
  alquilerSeleccionadoId: number | null = null;
  alquilerEditable: Alquiler = { cliente: '', articuloId: 0, cantidadAlquilada: 0, fechaInicio: '', fechaVencimiento: '', estado: 'RESERVADO' };

  ngOnInit() {
    this.resetArticuloForm();
    this.resetAlquilerForm();
  }

  resetArticuloForm() {
    this.articuloSeleccionadoId = null;
    this.articuloEditable = { nombre: '', cantidadTotal: 0, tarifa: 0, tipoTarifa: 'DIA', fotoUrl: '' };
  }

  resetAlquilerForm() {
    this.alquilerSeleccionadoId = null;
    this.alquilerEditable = { cliente: '', articuloId: 0, cantidadAlquilada: 0, fechaInicio: '', fechaVencimiento: '', estado: 'RESERVADO' };
  }

  onArticuloSelected() {
    if (!this.articuloSeleccionadoId) {
      this.resetArticuloForm();
      return;
    }
    const found = this.inventario.find(a => a.id === Number(this.articuloSeleccionadoId));
    if (found) {
      this.articuloEditable = { ...found };
    }
  }

  onAlquilerSelected() {
    if (!this.alquilerSeleccionadoId) {
      this.resetAlquilerForm();
      return;
    }
    const found = this.agenda.find(a => a.id === Number(this.alquilerSeleccionadoId));
    if (found) {
      this.alquilerEditable = { ...found };
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.articuloEditable.fotoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarArticulo() {
    if (!this.articuloEditable.nombre || this.articuloEditable.cantidadTotal <= 0) return;
    this.actualizarArticulo.emit({ ...this.articuloEditable });
    this.resetArticuloForm();
  }

  guardarAlquiler() {
    if (!this.alquilerEditable.cliente || this.alquilerEditable.cantidadAlquilada <= 0) return;
    this.actualizarAlquiler.emit({ ...this.alquilerEditable });
    this.resetAlquilerForm();
  }

  borrarArticulo() {
    if (this.articuloSeleccionadoId && confirm('¿Estás seguro de que deseas eliminar permanentemente este artículo?')) {
      this.eliminarArticulo.emit(Number(this.articuloSeleccionadoId));
      this.resetArticuloForm();
    }
  }

  getNombreArticulo(id: number): string {
    const art = this.inventario.find(a => a.id === id);
    return art ? art.nombre : 'Desconocido';
  }
}
