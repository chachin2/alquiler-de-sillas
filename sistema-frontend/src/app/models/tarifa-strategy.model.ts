import { Alquiler } from './alquiler.model';
import { Articulo } from './articulo.model';

export interface TarifaStrategyResult {
  costoBase: number;
  costoRetraso: number;
  factor: number;
}

export interface TarifaStrategy {
  tipo: string;
  texto: string;
  calcular(alq: Alquiler, art: Articulo, diasBase: number, diasRetraso: number): TarifaStrategyResult;
}
