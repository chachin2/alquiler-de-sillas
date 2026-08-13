import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionNegocioComponent } from './configuracion-negocio.component';

describe('ConfiguracionNegocioComponent', () => {
  let component: ConfiguracionNegocioComponent;
  let fixture: ComponentFixture<ConfiguracionNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionNegocioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfiguracionNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
