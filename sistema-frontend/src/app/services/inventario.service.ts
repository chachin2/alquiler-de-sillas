import { Injectable } from '@angular/core';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {

  obtenerDisponible(articuloId: number, inventario: Articulo[], agenda: Alquiler[]): number {
    const art = inventario.find(a => a.id === Number(articuloId));
    if (!art) return 0;
    const comprometidos = agenda
      .filter(a => a.articuloId === Number(articuloId) && a.estado !== 'DEVUELTO')
      .reduce((sum, a) => sum + a.cantidadAlquilada, 0);
    return art.cantidadTotal - comprometidos;
  }

  obtenerPorcentajeOcupado(articuloId: number, inventario: Articulo[], agenda: Alquiler[]): number {
    const art = inventario.find(a => a.id === Number(articuloId));
    if (!art || art.cantidadTotal === 0) return 0;
    const disponible = this.obtenerDisponible(articuloId, inventario, agenda);
    return ((art.cantidadTotal - disponible) / art.cantidadTotal) * 100;
  }

  getNombreArticulo(id: number, inventario: Articulo[]): string {
    const art = inventario.find(a => a.id === Number(id));
    return art ? art.nombre : 'Desconocido';
  }

  obtenerTarifaArticulo(articuloId: number, inventario: Articulo[]): number {
    const art = inventario.find(a => a.id === Number(articuloId));
    return art ? art.tarifa : 0;
  }

  buscarArticulo(articuloId: number, inventario: Articulo[]): Articulo | undefined {
    return inventario.find(a => a.id === Number(articuloId));
  }
}
