import { TestBed } from '@angular/core/testing';

import { LogGuard } from './log-guard.service';

describe('LogGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogGuard = TestBed.get(LogGuard);
    expect(service).toBeTruthy();
  });
});
