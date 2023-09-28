import { MongoClient, ServerApiVersion } from "mongodb";

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
});

let conn;
try {
  conn = await client.connect();
  console.log("You successfully connected to MongoDB!");
} catch (e) {
  console.error(e);
  process.exit();
}

const db = conn.db("bookstore");
const collection = db.collection("books");

export {
  db,
  collection
}
