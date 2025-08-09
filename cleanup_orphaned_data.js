import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  username: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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

async function cleanupOrphanedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user with username 'admini'
    const adminUser = await User.findOne({ username: 'admini' });
    
    if (!adminUser) {
      console.log('❌ User with username "admini" not found!');
      console.log('Available users:');
      const allUsers = await User.find({}, { email: 1, username: 1, name: 1 });
      allUsers.forEach(user => {
        console.log(`- Email: ${user.email}, Username: ${user.username || 'N/A'}, Name: ${user.name || 'N/A'}`);
      });
      return;
    }

    console.log('✅ Found admin user:');
    console.log(`- ID: ${adminUser._id}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Username: ${adminUser.username}`);
    console.log(`- Name: ${adminUser.name || 'N/A'}`);

    // Get all existing users
    const allUsers = await User.find({});
    const validUserIds = allUsers.map(user => user._id.toString());
    
    console.log('\n=== CURRENT DATABASE STATE ===');
    console.log(`Total users in database: ${allUsers.length}`);
    
    // Get all projects
    const allProjects = await Project.find({});
    console.log(`Total projects in database: ${allProjects.length}`);

    // Find orphaned projects (projects with userId that doesn't exist in users collection)
    const orphanedProjects = [];
    const validProjects = [];
    const adminProjects = [];

    for (const project of allProjects) {
      const projectUserId = project.userId.toString();
      
      if (!validUserIds.includes(projectUserId)) {
        orphanedProjects.push(project);
      } else if (projectUserId === adminUser._id.toString()) {
        adminProjects.push(project);
      } else {
        validProjects.push(project);
      }
    }

    console.log('\n=== PROJECT ANALYSIS ===');
    console.log(`Projects belonging to admin user (${adminUser.username}): ${adminProjects.length}`);
    console.log(`Projects belonging to other valid users: ${validProjects.length}`);
    console.log(`Orphaned projects (user deleted): ${orphanedProjects.length}`);

    if (orphanedProjects.length > 0) {
      console.log('\n=== ORPHANED PROJECTS TO BE DELETED ===');
      orphanedProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title} (User ID: ${project.userId})`);
      });

      // Delete orphaned projects
      const orphanedIds = orphanedProjects.map(p => p._id);
      const deleteResult = await Project.deleteMany({ _id: { $in: orphanedIds } });
      console.log(`\n✅ Deleted ${deleteResult.deletedCount} orphaned projects`);
    } else {
      console.log('\n✅ No orphaned projects found');
    }

    // Show projects belonging to other users (not admin)
    if (validProjects.length > 0) {
      console.log('\n=== PROJECTS FROM OTHER USERS ===');
      const projectsByUser = {};
      
      for (const project of validProjects) {
        const userId = project.userId.toString();
        if (!projectsByUser[userId]) {
          const user = allUsers.find(u => u._id.toString() === userId);
          projectsByUser[userId] = {
            user: user,
            projects: []
          };
        }
        projectsByUser[userId].projects.push(project);
      }

      for (const [userId, data] of Object.entries(projectsByUser)) {
        console.log(`\nUser: ${data.user.email} (${data.user.username || 'no username'})`);
        console.log(`Projects: ${data.projects.length}`);
        data.projects.forEach((project, index) => {
          console.log(`  ${index + 1}. ${project.title}`);
        });
      }

      console.log('\n⚠️  Do you want to delete projects from other users as well?');
      console.log('   If yes, run this script again with confirmation.');
    }

    // Final summary
    const finalProjectCount = await Project.countDocuments();
    const adminProjectCount = await Project.countDocuments({ userId: adminUser._id });
    
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total projects remaining: ${finalProjectCount}`);
    console.log(`Projects belonging to admin (${adminUser.username}): ${adminProjectCount}`);
    console.log(`Projects belonging to other users: ${finalProjectCount - adminProjectCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

cleanupOrphanedData();