import { TestBed } from '@angular/core/testing';

import { ProfileDetailResolverService } from './profile-detail-resolver.service';

describe('ProfileDetailResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfileDetailResolverService = TestBed.get(ProfileDetailResolverService);
    expect(service).toBeTruthy();
  });
});
