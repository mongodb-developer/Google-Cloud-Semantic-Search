import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from './book';

const URL = 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  constructor(private http: HttpClient) { }

  list(limit = 12) {
    if (limit > 100) {
      limit = 12;
   }

    return this.http.get<Book[]>(`${URL}/books?limit=${limit}`);
  }

  search(query: string, limit = 4) {
    if (limit > 50) {
      limit = 4;
    }

    const result = this.http.get<Book[]>(`${URL}/books/search?term=${query}&limit=${limit}`);

    return result;
  }
}
