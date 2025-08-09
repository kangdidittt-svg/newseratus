const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://kangdidittt:bujanggalau22@cluster0dev.domxcgy.mongodb.net/freelance-trackers?retryWrites=true&w=majority&appName=Cluster0dev';

// Project schema (simplified)
const ProjectSchema = new mongoose.Schema({
  title: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { collection: 'projects' });

const Project = mongoose.model('Project', ProjectSchema);

async function fixProjectStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Status mapping from old to new
    const statusMapping = {
      'Pending': 'active',
      'In Progress': 'active', 
      'On Hold': 'on-hold',
      'Completed': 'completed',
      'Cancelled': 'cancelled'
    };

    // Priority mapping from old to new
    const priorityMapping = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high'
    };

    // Find all projects
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects`);

    let updatedCount = 0;

    for (const project of projects) {
      let needsUpdate = false;
      const updates = {};

      // Check and fix status
      if (statusMapping[project.status]) {
        updates.status = statusMapping[project.status];
        needsUpdate = true;
        console.log(`Updating status: ${project.status} -> ${updates.status}`);
      }

      // Check and fix priority
      if (priorityMapping[project.priority]) {
        updates.priority = priorityMapping[project.priority];
        needsUpdate = true;
        console.log(`Updating priority: ${project.priority} -> ${updates.priority}`);
      }

      if (needsUpdate) {
        await Project.findByIdAndUpdate(project._id, updates);
        updatedCount++;
        console.log(`Updated project: ${project.title}`);
      }
    }

    console.log(`\nUpdated ${updatedCount} projects`);
    
    // Verify results
    const updatedProjects = await Project.find({});
    console.log('\nFinal status distribution:');
    const statusCounts = {};
    const priorityCounts = {};
    
    updatedProjects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      priorityCounts[p.priority] = (priorityCounts[p.priority] || 0) + 1;
    });
    
    console.log('Status:', statusCounts);
    console.log('Priority:', priorityCounts);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixProjectStatus();