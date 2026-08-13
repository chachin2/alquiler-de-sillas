import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { Auditoria } from '../models/auditoria.model';
import { User } from '../models/user.model';

import { SistemaRepository } from './sistema-repository';

const DB_NAME = 'SistemaAlquilerDB';
const DB_VERSION = 3;
const STORE_INVENTARIO = 'inventario';
const STORE_AGENDA = 'agenda';
const STORE_AUDITORIA = 'auditoria';
const STORE_USUARIOS = 'usuarios';

@Injectable({ providedIn: 'root' })
export class IndexedDbService implements SistemaRepository {
  private db: IDBDatabase | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_INVENTARIO)) {
          db.createObjectStore(STORE_INVENTARIO, { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_AGENDA)) {
          db.createObjectStore(STORE_AGENDA, { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_AUDITORIA)) {
          db.createObjectStore(STORE_AUDITORIA, { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_USUARIOS)) {
          db.createObjectStore(STORE_USUARIOS, { keyPath: 'id', autoIncrement: true });
          // also add an index by username for quicker lookups
          const store = request.transaction?.objectStore(STORE_USUARIOS);
          if (store) {
            store.createIndex('username', 'username', { unique: true });
          }
        }
      };

      request.onsuccess = async () => {
        this.db = request.result;
        // Verify if we need to seed the admin user
        try {
          await this.seedAdminUserIfNeeded(this.db);
        } catch (e) {
          console.error("Error seeding admin user:", e);
        }
        resolve(this.db);
      };

      request.onerror = () => {
        reject(new Error(request.error?.message || 'Error opening database'));
      };
    });
  }

  private requestToPromise<T>(request: IDBRequest): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(new Error(request.error?.message || 'Database request failed'));
    });
  }

  // ── Inventario ──

  obtenerInventario(): Observable<Articulo[]> {
    return from(this.doObtenerInventario());
  }

  private async doObtenerInventario(): Promise<Articulo[]> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_INVENTARIO, 'readonly');
    const store = tx.objectStore(STORE_INVENTARIO);
    return this.requestToPromise<Articulo[]>(store.getAll());
  }

  registrarArticulo(articulo: Articulo): Observable<Articulo> {
    return from(this.doRegistrarArticulo(articulo));
  }

  private async doRegistrarArticulo(articulo: Articulo): Promise<Articulo> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_INVENTARIO, 'readwrite');
    const store = tx.objectStore(STORE_INVENTARIO);

    const artSinId = { ...articulo };
    if (!artSinId.id) delete artSinId.id;

    const id = await this.requestToPromise<number>(store.put(artSinId));
    return { ...artSinId, id: id || artSinId.id };
  }

  actualizarArticulo(articulo: Articulo): Observable<Articulo> {
    return from(this.doActualizarArticulo(articulo));
  }

  private async doActualizarArticulo(articulo: Articulo): Promise<Articulo> {
    return this.doRegistrarArticulo(articulo); // Reusing registrarArticulo because store.put handles updates
  }

  // ── Agenda / Alquileres ──

  obtenerAgenda(): Observable<Alquiler[]> {
    return from(this.doObtenerAgenda());
  }

  private async doObtenerAgenda(): Promise<Alquiler[]> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_AGENDA, 'readonly');
    const store = tx.objectStore(STORE_AGENDA);
    return this.requestToPromise<Alquiler[]>(store.getAll());
  }

  eliminarAlquiler(id: number): Observable<void> {
    return from(this.doEliminarAlquiler(id));
  }

  private async doEliminarAlquiler(id: number): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_AGENDA, 'readwrite');
    const store = tx.objectStore(STORE_AGENDA);
    await this.requestToPromise(store.delete(id));
  }

  registrarAlquiler(alquiler: Alquiler): Observable<{ error?: string; success?: string }> {
    return from(this.doRegistrarAlquiler(alquiler));
  }

  private async doRegistrarAlquiler(alquiler: Alquiler): Promise<{ error?: string; success?: string }> {
    const db = await this.openDb();
    
    // Primero validar disponibilidad
    const txRead = db.transaction([STORE_INVENTARIO, STORE_AGENDA], 'readonly');
    const inventarioStore = txRead.objectStore(STORE_INVENTARIO);
    const agendaStore = txRead.objectStore(STORE_AGENDA);

    const articulo = await this.requestToPromise<Articulo | undefined>(inventarioStore.get(Number(alquiler.articuloId)));

    if (!articulo) {
      return { error: 'El artículo seleccionado no existe.' };
    }

    const agenda = await this.requestToPromise<Alquiler[]>(agendaStore.getAll());
    
    const comprometidos = agenda
      .filter(a => a.articuloId === Number(alquiler.articuloId) && a.estado !== 'DEVUELTO')
      .reduce((sum, a) => sum + a.cantidadAlquilada, 0);

    const disponible = articulo.cantidadTotal - comprometidos;

    if (alquiler.cantidadAlquilada > disponible) {
      return { error: `Stock insuficiente. Solo hay ${disponible} unidades disponibles.` };
    }

    // Validación ok, guardar el alquiler
    const txWrite = db.transaction(STORE_AGENDA, 'readwrite');
    const writeStore = txWrite.objectStore(STORE_AGENDA);

    const alqSinId = { ...alquiler, articuloId: Number(alquiler.articuloId) };
    delete alqSinId.id;

    await this.requestToPromise(writeStore.add(alqSinId));
    
    return { success: 'Operación agendada de forma correcta.' };
  }

  actualizarAlquiler(alquiler: Alquiler): Observable<Alquiler> {
    return from(this.doActualizarAlquiler(alquiler));
  }

  private async doActualizarAlquiler(alquiler: Alquiler): Promise<Alquiler> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_AGENDA, 'readwrite');
    const store = tx.objectStore(STORE_AGENDA);
    await this.requestToPromise(store.put(alquiler));
    return alquiler;
  }

  eliminarArticulo(id: number): Observable<void> {
    return from(this.doEliminarArticulo(id));
  }

  private async doEliminarArticulo(id: number): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_INVENTARIO, 'readwrite');
    const store = tx.objectStore(STORE_INVENTARIO);
    await this.requestToPromise(store.delete(id));
  }

  // ── Auditoría ──

  registrarAuditoria(entry: Auditoria): Observable<Auditoria> {
    return from(this.doRegistrarAuditoria(entry));
  }

  private async doRegistrarAuditoria(entry: Auditoria): Promise<Auditoria> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_AUDITORIA, 'readwrite');
    const store = tx.objectStore(STORE_AUDITORIA);
    const sinId = { ...entry };
    delete sinId.id;
    const id = await this.requestToPromise<number>(store.add(sinId));
    return { ...sinId, id };
  }

  obtenerAuditoria(): Observable<Auditoria[]> {
    return from(this.doObtenerAuditoria());
  }

  private async doObtenerAuditoria(): Promise<Auditoria[]> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_AUDITORIA, 'readonly');
    const store = tx.objectStore(STORE_AUDITORIA);
    const result = await this.requestToPromise<Auditoria[]>(store.getAll());
    return result.reverse(); // más recientes primero
  }

  // ── Usuarios ──

  private async seedAdminUserIfNeeded(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_USUARIOS, 'readonly');
      const store = tx.objectStore(STORE_USUARIOS);
      const countReq = store.count();
      countReq.onsuccess = async () => {
        if (countReq.result === 0) {
          // Add default admin user
          const writeTx = db.transaction(STORE_USUARIOS, 'readwrite');
          const writeStore = writeTx.objectStore(STORE_USUARIOS);
          
          // Hash for 'admin123' using SHA-256 (simplified for seeding).
          // We'll generate it using crypto api dynamically or use a known hash.
          // Since we can't easily wait for crypto inside IndexedDB upgrade if we're not careful, 
          // let's just do it directly.
          const encoder = new TextEncoder();
          const data = encoder.encode('admin123');
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          writeStore.add({ 
            username: 'admin', 
            passwordHash: hashHex,
            modulos: ['dashboard', 'inventario', 'gestiones', 'edicion', 'configuracion', 'auditoria']
          });
          writeTx.oncomplete = () => resolve();
          writeTx.onerror = () => reject(writeTx.error);
        } else {
          resolve();
        }
      };
      countReq.onerror = () => reject(countReq.error);
    });
  }

  obtenerUsuarios(): Observable<User[]> {
    return from(this.doObtenerUsuarios());
  }

  private async doObtenerUsuarios(): Promise<User[]> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_USUARIOS, 'readonly');
    const store = tx.objectStore(STORE_USUARIOS);
    return this.requestToPromise<User[]>(store.getAll());
  }

  registrarUsuario(user: User): Observable<User> {
    return from(this.doRegistrarUsuario(user));
  }

  private async doRegistrarUsuario(user: User): Promise<User> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_USUARIOS, 'readwrite');
    const store = tx.objectStore(STORE_USUARIOS);
    
    // Check if username already exists
    const index = store.index('username');
    const getReq = index.get(user.username);
    const existingUser = await this.requestToPromise<User | undefined>(getReq);
    
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    const sinId = { ...user };
    if (!sinId.id) delete sinId.id;
    const id = await this.requestToPromise<number>(store.add(sinId));
    return { ...sinId, id };
  }

  eliminarUsuario(id: number): Observable<void> {
    return from(this.doEliminarUsuario(id));
  }

  private async doEliminarUsuario(id: number): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_USUARIOS, 'readwrite');
    const store = tx.objectStore(STORE_USUARIOS);
    await this.requestToPromise(store.delete(id));
  }

  actualizarUsuario(user: User): Observable<User> {
    return from(this.doActualizarUsuario(user));
  }

  private async doActualizarUsuario(user: User): Promise<User> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_USUARIOS, 'readwrite');
    const store = tx.objectStore(STORE_USUARIOS);
    await this.requestToPromise(store.put(user));
    return user;
  }
}
