import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book';
import { map } from 'rxjs';
import { BookView } from './book-view';

const backendPort = '5000';
const URL = `${location.protocol}//${location.hostname.replace('-4200', `-${backendPort}`)}${location.port ? `:${backendPort}` : ''}`;

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  constructor(private http: HttpClient) { }

  list(limit = 12) {
    if (limit > 100) {
      limit = 12;
   }

    return this.http.get<Book[]>(`${URL}/books?limit=${limit}`)
      .pipe(
        map(books => books.map(book => new BookView(book)))
      );

  }

  search(query: string) {
    return this.http.get<Book[]>(`${URL}/books/search?term=${query}`)
      .pipe(
        map(books => books.map(book => new BookView(book)))
      );
  }

  searchByImage(query: string) {
    return this.http.get<Book[]>(`${URL}/books/search-by-image?url=${query}`)
      .pipe(
        map(books => books.map(book => new BookView(book)))
      );
  }
}
