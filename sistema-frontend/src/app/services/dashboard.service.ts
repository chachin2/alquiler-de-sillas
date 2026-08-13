import { Injectable } from '@angular/core';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { InventarioService } from './inventario.service';

export interface StatusCount {
  label: string;
  count: number;
  color: string;
  pct: number;
}

export interface OcupacionItem {
  nombre: string;
  disponible: number;
  ocupado: number;
  total: number;
  pct: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private inventarioService: InventarioService) {}

  getTotalArticulos(inventario: Articulo[]): number {
    return inventario.length;
  }

  getTotalDisponible(inventario: Articulo[], agenda: Alquiler[]): number {
    return inventario.reduce((sum, art) => {
      return sum + this.inventarioService.obtenerDisponible(art.id!, inventario, agenda);
    }, 0);
  }

  getTotalAlquileres(agenda: Alquiler[]): number {
    return agenda.length;
  }

  getTotalEnUso(agenda: Alquiler[]): number {
    return agenda.filter(a => a.estado === 'EN_USO').length;
  }

  getTotalReservados(agenda: Alquiler[]): number {
    return agenda.filter(a => a.estado === 'RESERVADO').length;
  }

  getTotalDevueltos(agenda: Alquiler[]): number {
    return agenda.filter(a => a.estado === 'DEVUELTO').length;
  }

  getStatusCounts(agenda: Alquiler[]): StatusCount[] {
    const total = agenda.length || 1;
    const counts = [
      { label: 'Reservados', count: this.getTotalReservados(agenda), color: '#6366f1' }, // Indigo 500
      { label: 'En Uso', count: this.getTotalEnUso(agenda), color: '#f59e0b' },        // Amber 500
      { label: 'Devueltos', count: this.getTotalDevueltos(agenda), color: '#10b981' },    // Emerald 500
    ];
    return counts.map(c => ({ ...c, pct: (c.count / total) * 100 }));
  }

  getConicGradient(agenda: Alquiler[]): string {
    const parts = this.getStatusCounts(agenda);
    let current = 0;
    const stops = parts
      .filter(p => p.count > 0)
      .map(p => {
        const start = current;
        current += p.pct;
        return `${p.color} ${start}% ${current}%`;
      });
    return stops.length ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(rgba(148, 163, 184, 0.2) 0% 100%)';
  }

  getOcupacionPorArticulo(inventario: Articulo[], agenda: Alquiler[]): OcupacionItem[] {
    return inventario.map(art => {
      const disponible = this.inventarioService.obtenerDisponible(art.id!, inventario, agenda);
      const total = art.cantidadTotal;
      const ocupado = total - disponible;
      const pct = total > 0 ? (ocupado / total) * 100 : 0;
      return { nombre: art.nombre, disponible, ocupado, total, pct };
    });
  }

  getUnidadesTotales(inventario: Articulo[]): number {
    return inventario.reduce((s, a) => s + a.cantidadTotal, 0);
  }

  getUnidadesEnUso(agenda: Alquiler[]): number {
    return agenda.filter(a => a.estado !== 'DEVUELTO').reduce((s, a) => s + a.cantidadAlquilada, 0);
  }

  getOcupacionGlobal(inventario: Articulo[], agenda: Alquiler[]): string {
    if (inventario.length === 0) return '0%';
    const totalUds = this.getUnidadesTotales(inventario);
    if (totalUds === 0) return '0%';
    const enUso = this.getUnidadesEnUso(agenda);
    return Math.round((enUso / totalUds) * 100) + '%';
  }
}
