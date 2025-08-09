import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = 'freelance-trackers';

async function checkAtlasData() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db(dbName);
    const projectsCollection = db.collection('projects');
    
    // Check total projects
    const totalCount = await projectsCollection.countDocuments();
    console.log(`Total projects in database: ${totalCount}`);
    
    // Check projects with specific userId
    const userIdCount = await projectsCollection.countDocuments({ userId: '6896367b1ca7a546acd009e2' });
    console.log(`Projects with userId '6896367b1ca7a546acd009e2': ${userIdCount}`);
    
    // Get sample project to check structure
    const sampleProject = await projectsCollection.findOne();
    if (sampleProject) {
      console.log('\nSample project structure:');
      console.log('- _id:', sampleProject._id);
      console.log('- title:', sampleProject.title);
      console.log('- userId:', sampleProject.userId);
      console.log('- userId type:', typeof sampleProject.userId);
      console.log('- status:', sampleProject.status);
    } else {
      console.log('No projects found in database');
    }
    
    // Get all unique userIds
    const uniqueUserIds = await projectsCollection.distinct('userId');
    console.log('\nUnique userIds in database:', uniqueUserIds);
    
  } catch (error) {
    console.error('Error checking Atlas data:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB Atlas');
  }
}

checkAtlasData();