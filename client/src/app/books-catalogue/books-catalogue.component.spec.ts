import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksCatalogueComponent } from './books-catalogue.component';

describe('BooksCatalogueComponent', () => {
  let component: BooksCatalogueComponent;
  let fixture: ComponentFixture<BooksCatalogueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BooksCatalogueComponent]
    });
    fixture = TestBed.createComponent(BooksCatalogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
