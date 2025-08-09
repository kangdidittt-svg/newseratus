require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkProjectUsers() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('seratusstudio');
    
    console.log('=== CHECKING PROJECT USER IDs ===');
    
    // Get sample projects with userId
    const projects = await db.collection('projects').find({}).limit(10).toArray();
    
    console.log('Sample projects:');
    projects.forEach(p => {
      console.log(`ID: ${p._id}`);
      console.log(`Title: ${p.title}`);
      console.log(`UserId: ${p.userId}`);
      console.log(`Status: ${p.status}`);
      console.log('---');
    });
    
    // Check unique userIds
    const uniqueUserIds = await db.collection('projects').distinct('userId');
    console.log('\nUnique User IDs in projects:');
    uniqueUserIds.forEach(userId => {
      console.log(`UserId: ${userId}`);
    });
    
    // Check demo user ID
    const demoUserId = '6896367b1ca7a546acd009e2';
    const demoProjects = await db.collection('projects').countDocuments({ userId: demoUserId });
    console.log(`\nProjects for demo user (${demoUserId}): ${demoProjects}`);
    
    // Check with ObjectId
    const { ObjectId } = require('mongodb');
    const demoObjectId = new ObjectId(demoUserId);
    const demoProjectsObjectId = await db.collection('projects').countDocuments({ userId: demoObjectId });
    console.log(`Projects for demo user (ObjectId): ${demoProjectsObjectId}`);
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProjectUsers();