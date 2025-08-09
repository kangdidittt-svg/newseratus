import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing required environment variables');
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

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUserSpecificData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      console.log('Demo user not found!');
      return;
    }
    
    console.log('\n=== DEMO USER INFO ===');
    console.log('User ID:', demoUser._id.toString());
    console.log('User Email:', demoUser.email);
    console.log('User Name:', demoUser.name);

    // Check projects for this specific user
    const userProjects = await Project.find({ userId: demoUser._id });
    console.log('\n=== USER PROJECTS ===');
    console.log('Total projects for demo user:', userProjects.length);
    
    if (userProjects.length > 0) {
      console.log('\nProject details:');
      userProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.title}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Budget: $${project.budget || 0}`);
        console.log(`   Hours Worked: ${project.hoursWorked || 0}`);
        console.log(`   Earnings: $${project.earnings || 0}`);
        console.log(`   Payment Status: ${project.paymentStatus}`);
        console.log(`   User ID: ${project.userId}`);
        console.log('');
      });

      // Calculate statistics
      const activeProjects = userProjects.filter(p => p.status === 'active').length;
      const completedProjects = userProjects.filter(p => p.status === 'completed').length;
      const onHoldProjects = userProjects.filter(p => p.status === 'on-hold').length;
      const cancelledProjects = userProjects.filter(p => p.status === 'cancelled').length;
      
      const totalEarnings = userProjects.reduce((sum, p) => sum + (p.earnings || 0), 0);
      const totalHours = userProjects.reduce((sum, p) => sum + (p.hoursWorked || 0), 0);
      const pendingPayments = userProjects
        .filter(p => p.paymentStatus === 'pending')
        .reduce((sum, p) => sum + (p.budget || 0), 0);

      console.log('\n=== CALCULATED STATISTICS ===');
      console.log('Active Projects:', activeProjects);
      console.log('Completed Projects:', completedProjects);
      console.log('On Hold Projects:', onHoldProjects);
      console.log('Cancelled Projects:', cancelledProjects);
      console.log('Total Earnings: $', totalEarnings);
      console.log('Total Hours:', totalHours);
      console.log('Pending Payments: $', pendingPayments);
    }

    // Check all projects in database
    const allProjects = await Project.find({});
    console.log('\n=== ALL PROJECTS IN DATABASE ===');
    console.log('Total projects in database:', allProjects.length);
    
    // Group by userId
    const projectsByUser = {};
    allProjects.forEach(project => {
      const userId = project.userId.toString();
      if (!projectsByUser[userId]) {
        projectsByUser[userId] = [];
      }
      projectsByUser[userId].push(project);
    });

    console.log('\nProjects grouped by user:');
    for (const [userId, projects] of Object.entries(projectsByUser)) {
      const user = await User.findById(userId);
      console.log(`User ${userId} (${user?.email || 'unknown'}): ${projects.length} projects`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUserSpecificData();