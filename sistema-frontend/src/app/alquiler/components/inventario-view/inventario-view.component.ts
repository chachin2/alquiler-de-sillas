import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Articulo } from '../../../models/articulo.model';

@Component({
  selector: 'app-inventario-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario-view.component.html',
  styleUrls: ['./inventario-view.component.css']
})
export class InventarioViewComponent {
  @Input() inventario: Articulo[] = [];
  @Input() enviando: boolean = false;
  @Output() agregarArticulo = new EventEmitter<Articulo>();
  @Output() eliminarArticulo = new EventEmitter<number>();
  @Output() actualizarArticulo = new EventEmitter<Articulo>();

  nuevoArticulo: Articulo = { nombre: '', cantidadTotal: 0, tarifa: 0, tipoTarifa: 'DIA', fotoUrl: '' };
  articuloEditando: Articulo | null = null;
  sumandoStock: { [id: number]: boolean } = {};
  cantidadSumar: { [id: number]: number } = {};

  iniciarEdicion(articulo: Articulo) {
    this.articuloEditando = articulo;
    this.nuevoArticulo = { ...articulo };
  }

  cancelarEdicion() {
    this.articuloEditando = null;
    this.nuevoArticulo = { nombre: '', cantidadTotal: 0, tarifa: 0, tipoTarifa: 'DIA', fotoUrl: '' };
  }

  toggleSumarStock(id: number) {
    this.sumandoStock[id] = !this.sumandoStock[id];
    if (!this.sumandoStock[id]) {
      delete this.cantidadSumar[id];
    } else {
      this.cantidadSumar[id] = 0;
    }
  }

  confirmarSumarStock(articulo: Articulo) {
    const extra = this.cantidadSumar[articulo.id!];
    if (!extra || extra <= 0) return;
    this.actualizarArticulo.emit({
      ...articulo,
      cantidadTotal: articulo.cantidadTotal + extra
    });
    delete this.sumandoStock[articulo.id!];
    delete this.cantidadSumar[articulo.id!];
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.nuevoArticulo.fotoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.nuevoArticulo.nombre || this.nuevoArticulo.cantidadTotal <= 0) return;
    
    if (this.articuloEditando) {
      this.actualizarArticulo.emit({
        ...this.nuevoArticulo,
        id: this.articuloEditando.id
      });
      this.cancelarEdicion();
    } else {
      // Check if exists by name (case insensitive)
      const existente = this.inventario.find(a => a.nombre.toLowerCase() === this.nuevoArticulo.nombre.toLowerCase());
      if (existente) {
        this.actualizarArticulo.emit({ 
          ...existente, 
          cantidadTotal: existente.cantidadTotal + this.nuevoArticulo.cantidadTotal,
          fotoUrl: this.nuevoArticulo.fotoUrl || existente.fotoUrl 
        });
      } else {
        this.agregarArticulo.emit({ ...this.nuevoArticulo });
      }
      this.nuevoArticulo = { nombre: '', cantidadTotal: 0, tarifa: 0, tipoTarifa: 'DIA', fotoUrl: '' };
    }
  }

  eliminar(id?: number) {
    if (id) {
      if (this.articuloEditando && this.articuloEditando.id === id) {
        this.cancelarEdicion();
      }
      this.eliminarArticulo.emit(id);
    }
  }
}
