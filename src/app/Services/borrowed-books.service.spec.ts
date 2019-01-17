import { TestBed } from '@angular/core/testing';

import { BorrowedBooksService } from './borrowed-books.service';

describe('BorrowedBooksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BorrowedBooksService = TestBed.get(BorrowedBooksService);
    expect(service).toBeTruthy();
  });
});
