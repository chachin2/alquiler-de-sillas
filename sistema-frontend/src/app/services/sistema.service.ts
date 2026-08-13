import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { Auditoria } from '../models/auditoria.model';
import { SistemaRepository } from './sistema-repository';

@Injectable({ providedIn: 'root' })
export class SistemaService {

  constructor(private readonly db: SistemaRepository) {}

  obtenerInventario(): Observable<Articulo[]> {
    return this.db.obtenerInventario();
  }

  registrarArticulo(articulo: Articulo): Observable<Articulo> {
    return this.db.registrarArticulo(articulo);
  }

  actualizarArticulo(articulo: Articulo): Observable<Articulo> {
    return this.db.actualizarArticulo(articulo);
  }

  obtenerAgenda(): Observable<Alquiler[]> {
    return this.db.obtenerAgenda();
  }

  registrarAlquiler(alquiler: Alquiler): Observable<{ error?: string; success?: string }> {
    return this.db.registrarAlquiler(alquiler);
  }

  actualizarAlquiler(alquiler: Alquiler): Observable<Alquiler> {
    return this.db.actualizarAlquiler(alquiler);
  }

  eliminarArticulo(id: number): Observable<void> {
    return this.db.eliminarArticulo(id);
  }

  eliminarAlquiler(id: number): Observable<void> {
    return this.db.eliminarAlquiler(id);
  }

  registrarAuditoria(entry: Auditoria): Observable<Auditoria> {
    return this.db.registrarAuditoria(entry);
  }

  obtenerAuditoria(): Observable<Auditoria[]> {
    return this.db.obtenerAuditoria();
  }
}

