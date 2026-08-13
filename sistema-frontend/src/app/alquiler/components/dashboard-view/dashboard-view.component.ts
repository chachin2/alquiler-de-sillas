import { Component, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Articulo } from '../../../models/articulo.model';
import { Alquiler } from '../../../models/alquiler.model';
import { DashboardService } from '../../../services/dashboard.service';

declare var lucide: any;

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.css']
})
export class DashboardViewComponent implements AfterViewInit {
  @Input() inventario: Articulo[] = [];
  @Input() agenda: Alquiler[] = [];

  constructor(private dashboardService: DashboardService, private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  getTotalArticulos(): number {
    return this.dashboardService.getTotalArticulos(this.inventario);
  }

  getTotalDisponible(): number {
    return this.dashboardService.getTotalDisponible(this.inventario, this.agenda);
  }

  getTotalAlquileres(): number {
    return this.dashboardService.getTotalAlquileres(this.agenda);
  }

  getTotalEnUso(): number {
    return this.dashboardService.getTotalEnUso(this.agenda);
  }

  getTotalReservados(): number {
    return this.dashboardService.getTotalReservados(this.agenda);
  }

  getTotalDevueltos(): number {
    return this.dashboardService.getTotalDevueltos(this.agenda);
  }

  getStatusCounts() {
    return this.dashboardService.getStatusCounts(this.agenda);
  }

  getConicGradient(): SafeStyle {
    const gradient = this.dashboardService.getConicGradient(this.agenda);
    return this.sanitizer.bypassSecurityTrustStyle(gradient);
  }

  getOcupacionPorArticulo() {
    return this.dashboardService.getOcupacionPorArticulo(this.inventario, this.agenda);
  }

  getUnidadesTotales(): number {
    return this.dashboardService.getUnidadesTotales(this.inventario);
  }

  getUnidadesEnUso(): number {
    return this.dashboardService.getUnidadesEnUso(this.agenda);
  }

  getOcupacionGlobal(): string {
    return this.dashboardService.getOcupacionGlobal(this.inventario, this.agenda);
  }
}
