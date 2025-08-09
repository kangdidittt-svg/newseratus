import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function checkUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Get all users
    const users = await usersCollection.find({}).toArray();
    
    console.log(`\nTotal users in database: ${users.length}`);
    console.log('\n=== USER LIST ===');
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not specified'}`);
        console.log(`   Password Hash: ${user.password ? 'Set (encrypted)' : 'Not set'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

checkUsers();