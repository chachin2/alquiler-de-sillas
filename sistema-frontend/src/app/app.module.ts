import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { AlquilerComponent } from './alquiler/alquiler.component';
import { LoginComponent } from './login/login.component';
import { ConfiguracionNegocioComponent } from './configuracion/configuracion-negocio/configuracion-negocio.component';

import { DashboardViewComponent } from './alquiler/components/dashboard-view/dashboard-view.component';
import { InventarioViewComponent } from './alquiler/components/inventario-view/inventario-view.component';
import { GestionesViewComponent } from './alquiler/components/gestiones-view/gestiones-view.component';
import { AuditoriaViewComponent } from './alquiler/components/auditoria-view/auditoria-view.component';
import { EdicionViewComponent } from './alquiler/components/edicion-view/edicion-view.component';

import { SistemaRepository } from './services/sistema-repository';
import { IndexedDbService } from './services/indexeddb.service';

@NgModule({
  declarations: [AppComponent, AlquilerComponent, LoginComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ConfiguracionNegocioComponent,
    DashboardViewComponent,
    InventarioViewComponent,
    GestionesViewComponent,
    AuditoriaViewComponent,
    EdicionViewComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:3000'
    })
  ],
  providers: [
    { provide: SistemaRepository, useClass: IndexedDbService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

