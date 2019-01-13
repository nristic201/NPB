import { TestBed } from '@angular/core/testing';

import { ProfileDetailResolver } from './profile-detail-resolver.service';

describe('ProfileDetailResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfileDetailResolver = TestBed.get(ProfileDetailResolver);
    expect(service).toBeTruthy();
  });
});
