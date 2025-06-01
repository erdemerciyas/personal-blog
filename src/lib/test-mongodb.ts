import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'process';

// Load environment variables from conf.env
dotenv.config({ path: './conf.env' });

async function testConnection() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in conf.env');
    }

    console.log('MongoDB URI:', mongoUri.replace(/:[^:]*@/, ':****@'));
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB!');
    
    // Test database operations
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collections = await db.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection(); 