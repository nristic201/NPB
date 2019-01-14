import { TestBed } from '@angular/core/testing';

import { BibliotekaService } from './biblioteka.service';

describe('BibliotekaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BibliotekaService = TestBed.get(BibliotekaService);
    expect(service).toBeTruthy();
  });
});
