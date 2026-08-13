import { Injectable } from '@angular/core';
import { Alquiler } from '../../models/alquiler.model';
import { Articulo } from '../../models/articulo.model';
import { TarifaStrategy, TarifaStrategyResult } from '../../models/tarifa-strategy.model';

@Injectable({ providedIn: 'root' })
export class SemanaTarifaStrategy implements TarifaStrategy {
  tipo = 'SEMANA';
  texto = 'Por Semana';

  calcular(alq: Alquiler, art: Articulo, diasBase: number, diasRetraso: number): TarifaStrategyResult {
    const factor = 1 / 7;
    const costoBase = art.tarifa * alq.cantidadAlquilada * diasBase * factor;
    const costoRetraso = art.tarifa * alq.cantidadAlquilada * diasRetraso * factor;
    return { costoBase, costoRetraso, factor };
  }
}
