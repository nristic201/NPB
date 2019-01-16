import { TestBed } from '@angular/core/testing';

import { SendIsbnService } from './send-isbn.service';

describe('SendIsbnService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SendIsbnService = TestBed.get(SendIsbnService);
    expect(service).toBeTruthy();
  });
});
