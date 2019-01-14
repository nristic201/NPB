import { TestBed } from '@angular/core/testing';

import { BibliotekaResolver } from './biblioteka-resolver.service';

describe('BibliotekaResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BibliotekaResolver = TestBed.get(BibliotekaResolver);
    expect(service).toBeTruthy();
  });
});
