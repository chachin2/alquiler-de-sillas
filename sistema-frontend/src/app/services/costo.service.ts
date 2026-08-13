import { Injectable } from '@angular/core';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { CostoDesglose } from '../models/costo.model';
import { TarifaStrategy } from '../models/tarifa-strategy.model';
import { HoraTarifaStrategy } from './strategies/hora-tarifa.strategy';
import { DiaTarifaStrategy } from './strategies/dia-tarifa.strategy';
import { SemanaTarifaStrategy } from './strategies/semana-tarifa.strategy';

@Injectable({ providedIn: 'root' })
export class CostoService {
  private strategies = new Map<string, TarifaStrategy>();

  constructor(
    horaStrategy: HoraTarifaStrategy,
    diaStrategy: DiaTarifaStrategy,
    semanaStrategy: SemanaTarifaStrategy
  ) {
    this.strategies.set(horaStrategy.tipo, horaStrategy);
    this.strategies.set(diaStrategy.tipo, diaStrategy);
    this.strategies.set(semanaStrategy.tipo, semanaStrategy);
  }

  getDaysDifference(d1: string, d2: string): number {
    if (!d1 || !d2) return 0;
    const date1 = new Date(d1 + 'T00:00:00');
    const date2 = new Date(d2 + 'T00:00:00');
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  }

  hoyFechaString(): string {
    return new Date().toISOString().split('T')[0];
  }

  esTardio(fechaVencimiento: string): boolean {
    return this.hoyFechaString() > fechaVencimiento;
  }

  obtenerTextoTarifa(tipoTarifa: string): string {
    const strategy = this.strategies.get(tipoTarifa);
    return strategy ? strategy.texto : 'Por Día';
  }

  calcularCosto(alq: Alquiler, art: Articulo | undefined): CostoDesglose {
    const vacio: CostoDesglose = {
      diasTotales: 0, diasContratados: 0, diasRetraso: 0,
      costoBase: 0, costoRetraso: 0, costoTotal: 0,
      rateName: 'DIA', rateText: 'Por Día', factor: 1, tarifa: 0
    };

    if (!art) return vacio;

    const diasBase = Math.max(1, this.getDaysDifference(alq.fechaInicio, alq.fechaVencimiento));

    let fechaFinEfectiva: string;
    if (alq.estado === 'DEVUELTO' && alq.fechaDevolucion) {
      fechaFinEfectiva = alq.fechaDevolucion;
    } else {
      const hoy = this.hoyFechaString();
      fechaFinEfectiva = hoy > alq.fechaVencimiento ? hoy : alq.fechaVencimiento;
    }

    let diasRetraso = 0;
    if (fechaFinEfectiva > alq.fechaVencimiento) {
      diasRetraso = this.getDaysDifference(alq.fechaVencimiento, fechaFinEfectiva);
    }

    // Seleccionar estrategia de cálculo según tipo de tarifa
    const strategy = this.strategies.get(art.tipoTarifa) || this.strategies.get('DIA')!;
    const res = strategy.calcular(alq, art, diasBase, diasRetraso);

    return {
      diasTotales: diasBase + diasRetraso,
      diasContratados: diasBase,
      diasRetraso,
      costoBase: res.costoBase,
      costoRetraso: res.costoRetraso,
      costoTotal: res.costoBase + res.costoRetraso,
      rateName: art.tipoTarifa,
      rateText: strategy.texto,
      factor: res.factor,
      tarifa: art.tarifa
    };
  }
}
