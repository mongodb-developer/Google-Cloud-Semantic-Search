import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const DATABASE = "bookstore";
const COLLECTION = "books";
const DESTINATION_COLLECTION = "vectorizedBooks";
const TEXT_FIELDS_TO_EMBED = [
  "genres",
  "synopsis",
];
const IMAGE_FIELD_TO_EMBED = "cover";

const EMBEDDING_ENDPOINT = process.env.MULTIMODAL_EMBEDDING_ENDPOINT;
if (!EMBEDDING_ENDPOINT) {
  throw new Error(
    `Add the URL of your Google Cloud Function for generating multimodal embeddings to .env:

MULTIMODAL_EMBEDDING_ENDPOINT="<YOUR_FUNCTION_URL>"`
  );
}

const client = new MongoClient(process.env.ATLAS_URI);
console.log("Connecting to MongoDB Atlas...");
const connection = await client.connect();
console.log("Connected.");

const collection = await getCollection(DATABASE, COLLECTION);
const destinationCollection = await getCollection(DATABASE, DESTINATION_COLLECTION);

await vectorizeBooks();

// await clearEmbeddings();

await client.close();

async function vectorizeBooks() {
  // Find all books that have not been vectorized yet
  const cursor = collection.aggregate([
    {
      $lookup: {
        from: DESTINATION_COLLECTION,
        localField: '_id',
        foreignField: 'bookId',
        as: 'vectorizedBooks'
      }
    },
    {
      $match: {
        vectorizedBooks: { $eq: [] } // Filters out documents with no match in vectorizedBooks
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        synopsis: 1,
        genres: 1,
        authors: 1,
        cover: 1,
      }
    }
  ]);

  await vectorizeData(cursor);
}

async function vectorizeData(cursor) {
  let promises = [];
  let counter = 1;

  while (!!(await cursor.hasNext())) {
    // Run embedding requests in batches
    for (let i = 0; i < 100; i++) {
      const document = await cursor.next();
      promises.push(
        vectorizeDocuments(document)
      );
    }

    console.log(`Vectorizing batch No ${counter}`);
    const vectorizedDocuments = (await Promise.all(promises)).filter(document => !!document).flat(1);

    console.log(`Inserting batch No ${counter}`);
    try {
      await destinationCollection.insertMany(vectorizedDocuments);
    } catch (e) {
      console.error(e);
    }

    promises = [];
    counter++;

    console.log("Waiting for 60 seconds to Vertex AI API rate limiting...");
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
}

function vectorizeDocuments(document) {
  return new Promise(async (resolve, _reject) => {
    let embeddings;
    try {

      const text = TEXT_FIELDS_TO_EMBED
        .map((field) => document[field] || "")
        .map((text) => Array.isArray(text) ? text.join(", ") : text)
        .join(" ")
        .replace(/(<([^>]+)>)/gi, "") // remove html tags
        .replace(/(\r\n|\n|\r)/gm, " ") // remove line breaks
        .substring(0, 1000);

      const imageURL = document[IMAGE_FIELD_TO_EMBED];

      embeddings = await getEmbeddings(text, imageURL);

      if (!embeddings) {
        return resolve();
      }
    } catch (error) {
      console.error(error);
      return resolve();
    }

    const newDocumentFields = {
      ...document,
      bookId: document._id,
    };
    delete newDocumentFields._id;

    // Insert two documents for each book, one with text embedding and one with image embedding
    const newDocuments = [
      {
        ...newDocumentFields,
        embeddingType: "text",
        embedding: embeddings.textEmbedding,
      },
      {
        ...newDocumentFields,
        embeddingType: "image",
        embedding: embeddings.imageEmbedding,
      }
    ];

    return resolve(newDocuments);
  });
}

async function getEmbeddings(text, imageURL) {
  if (!text || !imageURL) {
    console.log("No text or imageURL to embed");
    return;
  }

  const body = JSON.stringify({ text, imageURL });

  let response = await fetch(EMBEDDING_ENDPOINT, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    response = await response.json();
  } catch (error) {
    console.error(error);
    console.error(response);
    throw new Error("Parsing embeddings failed.");
  }

  if (response.error) {
    console.error(response.error);
    throw new Error("Generating embeddings failed.");
  }

  return response;
};

async function getCollection(databaseName, collectionName) {
  return connection.db(databaseName).collection(collectionName);
}

async function clearEmbeddings() {
  const collection = await getCollection(DATABASE, DESTINATION_COLLECTION);
  await collection.drop();
}
