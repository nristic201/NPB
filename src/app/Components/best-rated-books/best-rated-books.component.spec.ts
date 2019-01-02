import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestRatedBooksComponent } from './best-rated-books.component';

describe('BestRatedBooksComponent', () => {
  let component: BestRatedBooksComponent;
  let fixture: ComponentFixture<BestRatedBooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestRatedBooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestRatedBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
