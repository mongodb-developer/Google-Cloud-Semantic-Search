import { Author } from "./author";

export interface Book {
    _id: string;

    isbn: string;

    title: string;
    authors: Author[];
    cover: string;
    genres: string;
    synopsis: string;
    average_rating?: number;
    ratings_count?: number;
    score?: number;
}
