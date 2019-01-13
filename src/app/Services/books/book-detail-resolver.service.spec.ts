import { TestBed } from '@angular/core/testing';

import { BookDetailResolver } from './book-detail-resolver.service';

describe('BookDetailResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BookDetailResolver = TestBed.get(BookDetailResolver);
    expect(service).toBeTruthy();
  });
});
