export interface Auditoria {
  id?: number;
  accion: string;
  detalle: string;
  usuario?: string;
  fecha: string;
  hora: string;
}
