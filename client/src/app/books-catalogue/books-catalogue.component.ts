import { Component, OnInit } from '@angular/core';
import { BooksService } from '../books.service';
import { Observable, of } from 'rxjs';
import { Book } from '../book';

@Component({
  selector: 'app-books-catalogue',
  templateUrl: './books-catalogue.component.html',
  styleUrls: ['./books-catalogue.component.scss']
})
export class BooksCatalogueComponent implements OnInit {
  books$: Observable<Book[]>;

  constructor(private booksService: BooksService) {
  }

  ngOnInit(): void {
    this.books$ = this.booksService.list();
  }

  updateItems(items: Book[]) {
    this.books$ = of(items);
  }
}
