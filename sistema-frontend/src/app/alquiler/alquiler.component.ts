import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Articulo } from '../models/articulo.model';
import { Alquiler } from '../models/alquiler.model';
import { Auditoria } from '../models/auditoria.model';
import { CostoDesglose } from '../models/costo.model';
import { User } from '../models/user.model';
import { SistemaService } from '../services/sistema.service';
import { CostoService } from '../services/costo.service';
import { InventarioService } from '../services/inventario.service';
import { ConfiguracionNegocioService } from '../configuracion/configuracion-negocio.service';
import { AuthService } from '../services/auth.service';

declare var lucide: any;

@Component({
  selector: 'app-alquiler',
  templateUrl: './alquiler.component.html',
  styleUrls: ['./alquiler.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AlquilerComponent implements OnInit, AfterViewInit {
  inventario: Articulo[] = [];
  agenda: Alquiler[] = [];
  auditoria: Auditoria[] = [];

  mensajeError = '';
  mensajeExito = '';
  cargando = true;
  enviando = false;
  menuAbierto = false;
  vistaActual: 'dashboard' | 'inventario' | 'gestiones' | 'configuracion' | 'auditoria' | 'edicion' | '' = '';
  alquilerSeleccionado: Alquiler | null = null;
  isDarkMode = false;
  usuarioLogueado: User | null = null;

  businessConfig = { nombre: 'Mi Negocio', direccion: 'Dirección por defecto', logo: 'assets/logo.jpg' };

  constructor(
    private readonly service: SistemaService,
    private readonly costoService: CostoService,
    private readonly inventarioService: InventarioService,
    private readonly configService: ConfiguracionNegocioService,
    private readonly authService: AuthService
  ) {}

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.usuarioLogueado = user;
      this.determinarVistaInicial();
    });

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    }
    this.cargarDatos();
    this.configService.currentConfig.subscribe(config => {
      this.businessConfig = config;
      this.actualizarFavicon(config.logo);
    });
  }

  tieneAcceso(modulo: string): boolean {
    if (!this.usuarioLogueado) return false;
    // Si no tiene arreglo de modulos, por retrocompatibilidad le damos acceso (o podríamos negarlo)
    if (!this.usuarioLogueado.modulos) return true; 
    return this.usuarioLogueado.modulos.includes(modulo);
  }

  private determinarVistaInicial(): void {
    const ordenModulos: ('dashboard' | 'inventario' | 'gestiones' | 'edicion' | 'configuracion' | 'auditoria')[] = [
      'dashboard', 'inventario', 'gestiones', 'edicion', 'configuracion', 'auditoria'
    ];
    
    // Si la vista actual ya es válida y tiene acceso, no la cambiamos
    if (this.vistaActual && this.tieneAcceso(this.vistaActual)) return;

    for (const mod of ordenModulos) {
      if (this.tieneAcceso(mod)) {
        this.vistaActual = mod;
        return;
      }
    }
    this.vistaActual = ''; // Si no tiene acceso a nada (caso raro)
  }

  private actualizarFavicon(logoUrl: string): void {
    if (!logoUrl) return;
    const favLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favLink) {
      favLink.href = logoUrl;
    }
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleLink) {
      appleLink.href = logoUrl;
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    this.service.obtenerInventario().subscribe(data => this.inventario = data);
    this.service.obtenerAgenda().subscribe(data => {
      this.agenda = data;
      this.cargando = false;
    });
    this.cargarAuditoria();
  }

  cargarAuditoria(): void {
    this.service.obtenerAuditoria().subscribe(data => this.auditoria = data);
  }

  private registrarAuditoria(accion: string, detalle: string): void {
    const ahora = new Date();
    const entry: Auditoria = {
      accion,
      detalle,
      fecha: ahora.toLocaleDateString('es-GT'),
      hora: ahora.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    };
    this.service.registrarAuditoria(entry).subscribe(() => this.cargarAuditoria());
  }

  // ── Eventos de sub-componentes (Salidas) ──

  onAgregarArticulo(articulo: Articulo): void {
    this.enviando = true;
    this.service.registrarArticulo(articulo).subscribe(() => {
      this.mensajeExito = 'Artículo añadido al inventario.';
      this.registrarAuditoria('CREAR', `Artículo "${articulo.nombre}" agregado con ${articulo.cantidadTotal} uds`);
      this.cargarDatos();
      this.enviando = false;
      this.limpiarMensajes();
    });
  }

  onActualizarArticulo(articulo: Articulo): void {
    this.enviando = true;
    this.service.actualizarArticulo(articulo).subscribe(() => {
      this.mensajeExito = 'Inventario actualizado.';
      this.registrarAuditoria('ACTUALIZAR', `Inventario de "${articulo.nombre}" actualizado a ${articulo.cantidadTotal} uds`);
      this.cargarDatos();
      this.enviando = false;
      this.limpiarMensajes();
    });
  }

  onActualizarAlquiler(alquiler: Alquiler): void {
    this.enviando = true;
    this.service.actualizarAlquiler(alquiler).subscribe(() => {
      this.mensajeExito = 'Alquiler actualizado.';
      this.registrarAuditoria('ACTUALIZAR', `Alquiler de "${alquiler.cliente}" actualizado`);
      this.cargarDatos();
      this.enviando = false;
      this.limpiarMensajes();
    });
  }

  onEliminarArticulo(id: number): void {
    const art = this.inventarioService.buscarArticulo(id, this.inventario);
    const nombre = art?.nombre || 'Desconocido';
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
      this.enviando = true;
      this.service.eliminarArticulo(id).subscribe(() => {
        this.mensajeExito = 'Artículo eliminado del inventario.';
        this.registrarAuditoria('ELIMINAR', `Artículo "${nombre}" eliminado del inventario`);
        this.cargarDatos();
        this.enviando = false;
        this.limpiarMensajes();
      });
    }
  }

  onAgregarAlquiler(alquiler: Alquiler): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.enviando = true;
    this.service.registrarAlquiler(alquiler).subscribe(res => {
      if (res.error) {
        this.mensajeError = res.error;
      } else {
        this.mensajeExito = 'Operación agendada de forma correcta.';
        const nombre = this.inventarioService.getNombreArticulo(alquiler.articuloId, this.inventario);
        this.registrarAuditoria('RESERVAR', `"${nombre}" reservado por ${alquiler.cliente} (${alquiler.cantidadAlquilada} uds)`);
        this.cargarDatos();
      }
      this.enviando = false;
      this.limpiarMensajes();
    });
  }

  entregarAlquiler(alq: Alquiler): void {
    alq.estado = 'EN_USO';
    this.service.actualizarAlquiler(alq).subscribe({
      next: () => {
        this.mensajeExito = 'El artículo ha sido entregado al cliente.';
        const nombre = this.inventarioService.getNombreArticulo(alq.articuloId, this.inventario);
        this.registrarAuditoria('ENTREGAR', `"${nombre}" entregado a ${alq.cliente}`);
        this.cargarDatos();
        this.limpiarMensajes();
      },
      error: (err) => {
        this.mensajeError = 'Error al actualizar el estado: ' + err.message;
        this.limpiarMensajes();
      }
    });
  }

  devolverAlquiler(alq: Alquiler): void {
    alq.estado = 'DEVUELTO';
    alq.fechaDevolucion = this.costoService.hoyFechaString();
    const art = this.inventarioService.buscarArticulo(alq.articuloId, this.inventario);
    alq.costoTotal = this.costoService.calcularCosto(alq, art).costoTotal;

    this.service.actualizarAlquiler(alq).subscribe({
      next: () => {
        this.mensajeExito = 'El artículo ha sido devuelto correctamente. Cobro total congelado.';
        const nombre = this.inventarioService.getNombreArticulo(alq.articuloId, this.inventario);
        this.registrarAuditoria('DEVOLVER', `"${nombre}" devuelto por ${alq.cliente}. Total: Q${alq.costoTotal?.toFixed(2)}`);
        this.cargarDatos();
        this.limpiarMensajes();
      },
      error: (err) => {
        this.mensajeError = 'Error al registrar la devolución: ' + err.message;
        this.limpiarMensajes();
      }
    });
  }

  onCancelarAlquiler(alq: Alquiler): void {
    const nombre = this.inventarioService.getNombreArticulo(alq.articuloId, this.inventario);
    if (confirm(`¿Cancelar la reserva de "${nombre}" para ${alq.cliente}?`)) {
      this.service.eliminarAlquiler(alq.id!).subscribe(() => {
        this.mensajeExito = `Reserva de "${nombre}" cancelada.`;
        this.registrarAuditoria('CANCELAR', `Reserva de "${nombre}" cancelada para ${alq.cliente}`);
        this.cargarDatos();
        this.limpiarMensajes();
      });
    }
  }

  // ── Delegaciones a InventarioService (requeridos por Modal de Recibo) ──

  getNombreArticulo(id: number): string {
    return this.inventarioService.getNombreArticulo(id, this.inventario);
  }

  obtenerTarifaArticulo(articuloId: number): number {
    return this.inventarioService.obtenerTarifaArticulo(articuloId, this.inventario);
  }

  obtenerTextoTarifa(articuloId: number): string {
    const art = this.inventarioService.buscarArticulo(articuloId, this.inventario);
    return this.costoService.obtenerTextoTarifa(art?.tipoTarifa ?? 'DIA');
  }

  // ── Delegaciones a CostoService (requeridos por Modal de Recibo) ──

  calcularCosto(alq: Alquiler): CostoDesglose {
    const art = this.inventarioService.buscarArticulo(alq.articuloId, this.inventario);
    return this.costoService.calcularCosto(alq, art);
  }

  hoyFechaString(): string {
    return this.costoService.hoyFechaString();
  }

  esTardio(fechaVencimiento: string): boolean {
    return this.costoService.esTardio(fechaVencimiento);
  }

  // ── UI: Modal de Recibo ──

  verRecibo(alq: Alquiler): void {
    this.alquilerSeleccionado = alq;
  }

  cerrarRecibo(): void {
    this.alquilerSeleccionado = null;
  }

  imprimirRecibo(): void {
    if (!this.alquilerSeleccionado) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes (pop-ups) para exportar el recibo.');
      return;
    }

    const alq = this.alquilerSeleccionado;
    const nombreArticulo = this.getNombreArticulo(alq.articuloId);
    const tarifa = this.obtenerTarifaArticulo(alq.articuloId);
    const textoTarifa = this.obtenerTextoTarifa(alq.articuloId);
    const costo = this.calcularCosto(alq);
    const logoHtml = this.businessConfig.logo ? `<img src="${this.businessConfig.logo}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; margin-bottom: 12px; border: 2px solid #e2e8f0;" alt="Logo">` : '';
    const direccionHtml = this.businessConfig.direccion ? `<p style="margin: 2px 0 0; color: #64748b; font-size: 0.8rem;">${this.businessConfig.direccion}</p>` : '';
    const fechaRealHtml = alq.fechaDevolucion ? `<p><strong>Fecha de Devolución (Real):</strong> ${alq.fechaDevolucion}</p>` : '';
    const atrasoHtml = (!alq.fechaDevolucion && alq.estado === 'EN_USO' && this.esTardio(alq.fechaVencimiento)) 
      ? `<p style="color: #dc2626; background: #fef2f2; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 0.8rem; border: 1px solid #fecaca; margin: 3px 0;"><strong>¡ATENCIÓN!</strong> El alquiler se encuentra retrasado.</p>` 
      : '';
    const moraRowsHtml = costo.diasRetraso > 0 ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; color: #dc2626; font-weight: 600;">
        <span>Retraso acumulado:</span>
        <span>${costo.diasRetraso} ${costo.diasRetraso === 1 ? 'día' : 'días'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; color: #dc2626; font-weight: 600;">
        <span>Cargos por mora:</span>
        <span>Q${costo.costoRetraso.toFixed(2)}</span>
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo - ${alq.cliente}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 20px;
            background: #fff;
            margin: 0;
          }
          .receipt-container {
            max-width: 480px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 24px;
            border-radius: 8px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .receipt-header h2 {
            margin: 0;
            font-size: 1.25rem;
            color: #0f172a;
            font-weight: 800;
            text-transform: uppercase;
          }
          .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 14px 0;
            width: 100%;
          }
          .divider-double {
            border-top: 2px dashed #cbd5e1;
            margin: 14px 0;
            width: 100%;
          }
          .receipt-section {
            margin-bottom: 16px;
          }
          .receipt-section h3 {
            font-size: 0.78rem;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
            font-weight: 700;
          }
          .receipt-section p {
            margin: 4px 0;
            font-size: 0.9rem;
          }
          .receipt-totals {
            margin-top: 14px;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 24px;
            font-size: 0.85rem;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .receipt-container { border: none; max-width: 100%; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            ${logoHtml}
            <h2>${this.businessConfig.nombre}</h2>
            <p style="margin: 4px 0 6px; color: #64748b; font-size: 0.85rem;">Comprobante de Operación</p>
            ${direccionHtml}
            <div class="divider"></div>
          </div>

          <div class="receipt-section">
            <h3>DATOS DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> ${alq.cliente}</p>
            <p><strong>Fecha de Emisión:</strong> ${this.hoyFechaString()}</p>
          </div>

          <div class="receipt-section">
            <h3>DETALLE DEL ALQUILER</h3>
            <p><strong>Artículo:</strong> ${nombreArticulo}</p>
            <p><strong>Cantidad:</strong> ${alq.cantidadAlquilada} unidades</p>
            <p><strong>Tarifa Unitario:</strong> Q${tarifa} (${textoTarifa})</p>
            <p><strong>Estado Actual:</strong> ${alq.estado}</p>
          </div>

          <div class="receipt-section">
            <h3>CRONOGRAMA</h3>
            <p><strong>Fecha de Entrega:</strong> ${alq.fechaInicio}</p>
            <p><strong>Fecha de Devolución (Pactada):</strong> ${alq.fechaVencimiento}</p>
            ${fechaRealHtml}
            ${atrasoHtml}
          </div>

          <div class="divider"></div>

          <div class="receipt-totals">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
              <span>Tiempo transcurrido pactado:</span>
              <span>${costo.diasContratados} ${costo.diasContratados === 1 ? 'día' : 'días'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
              <span>Costo base pactado:</span>
              <span>Q${costo.costoBase.toFixed(2)}</span>
            </div>
            ${moraRowsHtml}
            <div class="divider-double"></div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 1.15rem; font-weight: 800; color: #0f172a;">
              <span>TOTAL A PAGAR:</span>
              <span>Q${costo.costoTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <p>¡Gracias por su preferencia!</p>
            <p style="font-size: 0.72rem; color: #94a3b8; margin-top: 8px; font-style: italic;">Este documento sirve como comprobante y confirmación oficial de los términos acordados.</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // ── UI: Mensajes ──

  private limpiarMensajes(): void {
    setTimeout(() => {
      this.mensajeError = '';
      this.mensajeExito = '';
    }, 5000);
  }
}
