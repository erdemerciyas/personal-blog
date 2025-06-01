import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
  var mongoClientConnection: {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
}

// Fallback to hard-coded URI if environment variable is not available
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Mongoose connection
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB (Mongoose) bağlantısı başarılı');
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB (Mongoose) bağlantı hatası:', e);
    throw e;
  }

  return cached.conn;
}

// MongoClient connection for other operations
let clientCached = global.mongoClientConnection;

if (!clientCached) {
  clientCached = global.mongoClientConnection = { client: null, promise: null };
}

export async function connectToDatabase() {
  if (clientCached.client) {
    return { client: clientCached.client, db: clientCached.client.db() };
  }

  if (!clientCached.promise) {
    const options = {};
    const client = new MongoClient(MONGODB_URI, options);
    clientCached.promise = client.connect();
  }

  try {
    clientCached.client = await clientCached.promise;
    console.log('✅ MongoDB (Client) bağlantısı başarılı');
    return { client: clientCached.client, db: clientCached.client.db() };
  } catch (e) {
    clientCached.promise = null;
    console.error('❌ MongoDB (Client) bağlantı hatası:', e);
    throw e;
  }
}

export default connectDB; 