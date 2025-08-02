import { MongoClient } from 'mongodb';
import env from './config.js';

let dbClient;

export const connectDB = async () => {
  if (dbClient){
    return dbClient;
  }

  try {
    const client = new MongoClient(env.DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    dbClient = client.db();
    console.log('✅ Connected to MongoDB');
    return dbClient;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!dbClient) {
    throw new Error('❌ Database not connected. Call connectDB() first.');
  }
  return dbClient;
};
