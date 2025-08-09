import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'freelance-trackers';

async function createTestUser() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Username: testuser');
      console.log('Password: password123');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create test user
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.insertOne(testUser);
    console.log('Test user created successfully!');
    console.log('Username: testuser');
    console.log('Password: password123');
    console.log('Email: test@example.com');
    console.log('User ID:', result.insertedId);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();