import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionNegocioService {
  private configSource = new BehaviorSubject(this.loadConfig());
  currentConfig = this.configSource.asObservable();

  private loadConfig() {
    const saved = localStorage.getItem('appConfig');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      nombre: 'Mi Negocio',
      direccion: 'Dirección por defecto',
      logo: 'assets/logo.jpg'
    };
  }

  updateConfig(nombre: string, direccion: string, logo: string) {
    const newConfig = { nombre, direccion, logo };
    localStorage.setItem('appConfig', JSON.stringify(newConfig));
    this.configSource.next(newConfig);
  }
}
