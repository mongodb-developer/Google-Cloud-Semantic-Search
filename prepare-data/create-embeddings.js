import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const EMBEDDING_FIELD_NAME = "text_embedding";
const DATABASE = "bookstore";
const COLLECTION = "books";
const FIELDS_TO_EMBED = [
  "title",
  "synopsis",
];

const EMBEDDING_ENDPOINT = process.env.EMBEDDING_ENDPOINT;
if (!EMBEDDING_ENDPOINT) {
    throw new Error(
`Add the URL of your Google Cloud Function for generating embeddings to .env:

EMBEDDING_ENDPOINT="<YOUR_FUNCTION_URL>"`
    );
}

const client = new MongoClient(process.env.ATLAS_URI);
console.log("Connecting to MongoDB Atlas...");
const connection = await client.connect();
console.log("Connected.");


await vectorizeBooks();

// await clearEmbeddings();

await client.close();

async function vectorizeBooks() {
  const collection = await getCollection(DATABASE, COLLECTION);
  const cursor = collection.aggregate([
    {
      $match: {
        [EMBEDDING_FIELD_NAME]: { $eq: null }
      }
    },
    {
      $project: {
        title: 1,
        synopsis: 1,
      }
    }
  ]);

  await vectorizeData(
    cursor,
    collection,
    FIELDS_TO_EMBED,
    EMBEDDING_FIELD_NAME
  );
}

async function vectorizeData(cursor, collection, fieldsToEmbed, embeddingFieldName) {
  let promises = [];
  let counter = 1;

  while (!!(await cursor.hasNext())) {
    // Run embedding requests in batches
    let docsToVectorize = [];
    for (let i = 0; i < 200; i++) {
      docsToVectorize = [];
      
      // Vertex AI allows you to generate 5 embeddings with one API call
      for (let j = 0; j < 5; j++) {
        try {
          const document = await cursor.next();
          docsToVectorize.push(document);
        } catch(error) {
          continue;
        }
      }

      if (docsToVectorize.length) {
        promises.push(
          vectorizeDocuments(docsToVectorize, collection, fieldsToEmbed, embeddingFieldName)
        );
      }
    }

    console.log(`Vectorizing batch No ${counter}`);
    await Promise.all(promises);

    promises = [];
    counter++;
  }
}

function vectorizeDocuments(documents, collection, fieldsToEmbed, embeddingFieldName) {
  return new Promise(async (resolve, _reject) => {
    let embeddings;
    try {

      const texts = documents
        .filter(document => !!document)
        .map(document => fieldsToEmbed.map((field) => document[field]).join(" "));

      embeddings = await getEmbeddings(texts);

      if (!embeddings) {
        return resolve();
      }
    } catch (error) {
      console.error(error);
      return resolve();
    }

    for (let document of documents) {
      const embedding = embeddings?.shift();
      if (!embedding) {
        continue;
      }

      await collection.updateOne(
        { _id: document._id },
        { $set: { [embeddingFieldName]: embedding } }
      )
    }

    return resolve();
  });
}

async function getEmbeddings(text) {
  if (!text) {
    console.log("No text to embed");
    return;
  }

  const body = JSON.stringify({ text });

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

  return response?.vectors || [];
};

async function getCollection(databaseName, collectionName) {
  return connection.db(databaseName).collection(collectionName);
}

async function clearEmbeddings() {
  const collection = await getCollection(DATABASE, COLLECTION);
  await collection.updateMany(
    {},
    {
      $unset: { [EMBEDDING_FIELD_NAME]: 1 }
    }
  );
}
