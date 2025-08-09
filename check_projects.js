import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function checkProjects() {
  try {
    await client.connect();
    const db = client.db('freelance-trackers');
    
    // Get all projects
    const allProjects = await db.collection('projects').find({}).toArray();
    console.log(`Total projects: ${allProjects.length}`);

    allProjects.forEach(project => {
      console.log(`- ${project.title}: status=${project.status}, budget=$${project.budget}, totalEarned=$${project.totalEarned}`);
    });

    // Get completed projects
    const completed = await db.collection('projects').find({status: 'completed'}).toArray();
    console.log(`\nCompleted projects: ${completed.length}`);

    // Get non-completed projects (for pending payments)
    const nonCompletedProjects = await db.collection('projects').find({status: {$ne: 'completed'}}).toArray();
    console.log(`\nNon-completed projects: ${nonCompletedProjects.length}`);

    nonCompletedProjects.forEach(project => {
      console.log(`- ${project.title}: status=${project.status}, budget=$${project.budget}`);
    });

    // Calculate total pending payments
    const totalPendingPayments = nonCompletedProjects.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0);

    console.log(`\nTotal Pending Payments: $${totalPendingPayments}`);
    
    // Calculate total earnings
    let totalEarnings = 0;
    completed.forEach(p => {
      const earned = p.totalEarned || (p.hoursWorked * p.hourlyRate);
      totalEarnings += earned;
    });
    
    console.log(`Total Earnings from completed projects: $${totalEarnings}`);
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

checkProjects();