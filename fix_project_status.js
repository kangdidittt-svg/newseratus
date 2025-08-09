import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['active', 'completed', 'on-hold', 'cancelled'], 
    default: 'active' 
  },
  budget: Number,
  hourlyRate: Number,
  hoursWorked: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

async function fixProjectStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all projects with invalid status
    const allProjects = await Project.find({});
    console.log('\n=== CURRENT PROJECT STATUS ===');
    
    const statusMapping = {
      'In Progress': 'active',
      'Pending': 'active',
      'Completed': 'completed',
      'On Hold': 'on-hold',
      'Cancelled': 'cancelled'
    };

    let updatedCount = 0;
    
    for (const project of allProjects) {
      console.log(`Project: ${project.title} - Current Status: ${project.status}`);
      
      if (statusMapping[project.status]) {
        const newStatus = statusMapping[project.status];
        await Project.findByIdAndUpdate(project._id, { 
          status: newStatus,
          updatedAt: new Date()
        });
        console.log(`  → Updated to: ${newStatus}`);
        updatedCount++;
      } else if (!['active', 'completed', 'on-hold', 'cancelled'].includes(project.status)) {
        // Default to active for any other invalid status
        await Project.findByIdAndUpdate(project._id, { 
          status: 'active',
          updatedAt: new Date()
        });
        console.log(`  → Updated to: active (default)`);
        updatedCount++;
      } else {
        console.log(`  → Status is valid, no change needed`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total projects checked: ${allProjects.length}`);
    console.log(`Projects updated: ${updatedCount}`);

    // Verify the changes
    console.log('\n=== VERIFICATION ===');
    const updatedProjects = await Project.find({});
    const statusCounts = {
      active: 0,
      completed: 0,
      'on-hold': 0,
      cancelled: 0
    };

    updatedProjects.forEach(project => {
      if (statusCounts.hasOwnProperty(project.status)) {
        statusCounts[project.status]++;
      } else {
        console.log(`Warning: Invalid status found: ${project.status}`);
      }
    });

    console.log('Status distribution:');
    console.log('- Active:', statusCounts.active);
    console.log('- Completed:', statusCounts.completed);
    console.log('- On Hold:', statusCounts['on-hold']);
    console.log('- Cancelled:', statusCounts.cancelled);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixProjectStatus();