export interface Alquiler {
  id?: number;
  articuloId: number;
  cliente: string;
  cantidadAlquilada: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  fechaDevolucion?: string;
  costoTotal?: number;
}

