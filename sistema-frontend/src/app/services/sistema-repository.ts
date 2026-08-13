import { Observable } from 'rxjs';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { Auditoria } from '../models/auditoria.model';

export abstract class SistemaRepository {
  abstract obtenerInventario(): Observable<Articulo[]>;
  abstract registrarArticulo(articulo: Articulo): Observable<Articulo>;
  abstract actualizarArticulo(articulo: Articulo): Observable<Articulo>;
  abstract obtenerAgenda(): Observable<Alquiler[]>;
  abstract registrarAlquiler(alquiler: Alquiler): Observable<{ error?: string; success?: string }>;
  abstract actualizarAlquiler(alquiler: Alquiler): Observable<Alquiler>;
  abstract eliminarArticulo(id: number): Observable<void>;
  abstract eliminarAlquiler(id: number): Observable<void>;
  abstract registrarAuditoria(entry: Auditoria): Observable<Auditoria>;
  abstract obtenerAuditoria(): Observable<Auditoria[]>;
}
