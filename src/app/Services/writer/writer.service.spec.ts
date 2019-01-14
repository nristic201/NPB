import { TestBed } from '@angular/core/testing';

import { WriterService } from './writer.service';

describe('WriterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WriterService = TestBed.get(WriterService);
    expect(service).toBeTruthy();
  });
});
