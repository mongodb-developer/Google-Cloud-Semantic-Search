import { readFileSync } from 'fs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const books = JSON.parse(readFileSync('./books.json'));
const client = new MongoClient(process.env.ATLAS_URI);

await client.connect();
const collection = client.db('bookstore').collection('books');
await collection.insertMany(books);

await client.close();
