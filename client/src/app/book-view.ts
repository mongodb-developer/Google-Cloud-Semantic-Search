import { Book } from "./book";

export class BookView {
    title: string;
    authors: string;
    synopsis: string;
    cover: string;
    score?: number; 

    constructor(book: Book) {
        this.title = book.title;
        this.synopsis = book.synopsis;
        this.score = book.score;
        this.cover = book.cover;

        this.authors = book.authors.map(a => a.name).join(', ');
    }
}
