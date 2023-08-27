export interface Book {
    title: string;
    authors: string;
    thumbnail: string;
    isbn: string;
    genres: string;
    description: string;
    average_rating?: number;
    ratings_count?: number;
    score?: number;
}
