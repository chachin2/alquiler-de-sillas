import { TestBed } from '@angular/core/testing';

import { ConfiguracionNegocioService } from './configuracion-negocio.service';

describe('ConfiguracionNegocioService', () => {
  let service: ConfiguracionNegocioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiguracionNegocioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
