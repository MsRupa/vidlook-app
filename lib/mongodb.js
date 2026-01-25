import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'vidlook_db';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

export default clientPromise;
