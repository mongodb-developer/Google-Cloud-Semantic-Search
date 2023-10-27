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

  search(query: string, limit = 4) {
    if (limit > 50) {
      limit = 4;
    }

    const result = this.http.get<Book[]>(`${URL}/books/search?term=${query}&limit=${limit}`);

    return result
      .pipe(
        map(books => books.map(book => new BookView(book)))
      );
  }
}
