import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
const clientPromise: Promise<MongoClient> = (async () => {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
})() as Promise<MongoClient>;

declare global {
  // Prevent multiple connections in dev
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export default clientPromise;
