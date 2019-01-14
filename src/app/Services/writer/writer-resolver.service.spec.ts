import { TestBed } from '@angular/core/testing';

import { WriterResolver } from './writer-resolver.service';

describe('WriterResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WriterResolver = TestBed.get(WriterResolver);
    expect(service).toBeTruthy();
  });
});
