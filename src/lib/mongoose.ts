import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalMongoClient {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: GlobalMongoose | undefined;
  // eslint-disable-next-line no-var
  var mongoClientConnection: GlobalMongoClient | undefined;
}

// MongoDB URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Type assertion after the check
const mongoUri = MONGODB_URI as string;

// Mongoose connection
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cached!.conn) {
    // Bağlantının hala aktif olup olmadığını kontrol et
    try {
      if (cached!.conn.connection.readyState === 1) {
        return cached!.conn;
      }
    } catch (error) {
      console.warn('Cached connection check failed, reconnecting...', error);
      cached!.conn = null;
      cached!.promise = null;
    }
  }

  if (!cached!.promise) {
    // Vercel serverless için optimize edilmiş ayarlar
    const opts = {
      bufferCommands: false,
      maxPoolSize: process.env.VERCEL ? 1 : 5, // Vercel serverless için tek connection
      serverSelectionTimeoutMS: 8000, // Biraz daha uzun timeout
      socketTimeoutMS: 45000, // Vercel function timeout'a uygun
      maxIdleTimeMS: 30000,
      // Vercel için connection maintenance
      heartbeatFrequencyMS: 10000,
      maxStalenessSeconds: 90,
      // Vercel serverless optimizations
      retryWrites: true,
      // Connection retry settings
      retryReads: true,
      maxConnecting: 2,
      // Stability improvements
      connectTimeoutMS: 10000,
      family: 4, // IPv4 kullan
    };

    cached!.promise = mongoose.connect(mongoUri, opts);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log('✅ MongoDB (Mongoose) bağlantısı başarılı');
  } catch (e) {
    cached!.promise = null;
    cached!.conn = null;
    console.error('❌ MongoDB (Mongoose) bağlantı hatası:', e);
    throw e;
  }

  return cached!.conn;
}

// MongoClient connection for other operations
let clientCached = global.mongoClientConnection;

if (!clientCached) {
  clientCached = global.mongoClientConnection = { client: null, promise: null };
}

export async function connectToDatabase() {
  if (clientCached!.client) {
    return { client: clientCached!.client, db: clientCached!.client.db() };
  }

  if (!clientCached!.promise) {
    // Vercel serverless için optimize edilmiş client ayarları
    const options = {
      maxPoolSize: process.env.VERCEL ? 1 : 5, // Vercel serverless için tek connection
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, // Vercel function timeout'a uygun
      retryWrites: true,
    };
    const client = new MongoClient(mongoUri, options);
    clientCached!.promise = client.connect();
  }

  try {
    clientCached!.client = await clientCached!.promise;
    console.log('✅ MongoDB (Client) bağlantısı başarılı');
    return { client: clientCached!.client, db: clientCached!.client.db() };
  } catch (e) {
    clientCached!.promise = null;
    console.error('❌ MongoDB (Client) bağlantı hatası:', e);
    throw e;
  }
}

// Connection cleanup for cPanel
process.on('SIGINT', async () => {
  try {
    if (cached!.conn) {
      await cached!.conn.disconnect();
      console.log('MongoDB Mongoose connection closed.');
    }
    if (clientCached!.client) {
      await clientCached!.client.close();
      console.log('MongoDB Client connection closed.');
    }
  } catch (err) {
    console.error('Error closing MongoDB connections:', err);
  }
  process.exit(0);
});

export default connectDB; 