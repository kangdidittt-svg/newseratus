const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Project schema (simplified)
const projectSchema = new mongoose.Schema({
  title: String,
  status: String,
  budget: Number,
  totalEarned: Number,
  userId: mongoose.Schema.Types.ObjectId
});

const Project = mongoose.model('Project', projectSchema);

async function debugPendingPayments() {
  try {
    // Get the first user ID from projects
    const firstProject = await Project.findOne();
    if (!firstProject) {
      console.log('No projects found');
      return;
    }
    
    const userId = firstProject.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    console.log('User ID:', userId);
    console.log('User ObjectId:', userObjectId);
    
    // Debug: Get all projects for this user
    const allProjects = await Project.find({ userId: userObjectId });
    console.log('\nAll projects for user:');
    allProjects.forEach(project => {
      console.log(`- ${project.title}: status=${project.status}, budget=$${project.budget}`);
    });
    
    // Debug: Get non-completed projects
    const nonCompletedProjects = await Project.find({ 
      userId: userObjectId, 
      status: { $ne: 'completed' } 
    });
    console.log('\nNon-completed projects:');
    nonCompletedProjects.forEach(project => {
      console.log(`- ${project.title}: status=${project.status}, budget=$${project.budget}`);
    });
    
    // Calculate pending payments using aggregation
    const pendingPaymentsResult = await Project.aggregate([
      { $match: { userId: userObjectId, status: { $ne: 'completed' } } },
      {
        $group: {
          _id: null,
          totalPendingPayments: { $sum: { $ifNull: ['$budget', 0] } }
        }
      }
    ]);
    
    const totalPendingPayments = pendingPaymentsResult[0]?.totalPendingPayments || 0;
    console.log('\nTotal Pending Payments from aggregation:', totalPendingPayments);
    
    // Manual calculation
    const manualTotal = nonCompletedProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
    console.log('Manual calculation total:', manualTotal);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPendingPayments();