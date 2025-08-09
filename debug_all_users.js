const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
  email: String,
  name: String
});

const projectSchema = new mongoose.Schema({
  title: String,
  status: String,
  budget: Number,
  totalEarned: Number,
  userId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);

async function debugAllUsers() {
  try {
    // Get all users
    const users = await User.find();
    console.log('All users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ID=${user._id}`);
    });
    
    console.log('\n=== PROJECTS BY USER ===');
    
    for (const user of users) {
      console.log(`\nUser: ${user.name} (${user._id})`);
      
      const userProjects = await Project.find({ userId: user._id });
      console.log(`Total projects: ${userProjects.length}`);
      
      if (userProjects.length > 0) {
        console.log('Projects:');
        userProjects.forEach(project => {
          console.log(`  - ${project.title}: status=${project.status}, budget=$${project.budget}, totalEarned=$${project.totalEarned}`);
        });
        
        // Calculate pending payments for this user
        const pendingPaymentsResult = await Project.aggregate([
          { $match: { userId: user._id, status: { $ne: 'completed' } } },
          {
            $group: {
              _id: null,
              totalPendingPayments: { $sum: { $ifNull: ['$budget', 0] } }
            }
          }
        ]);
        
        const totalPendingPayments = pendingPaymentsResult[0]?.totalPendingPayments || 0;
        console.log(`  Pending Payments: $${totalPendingPayments}`);
        
        // Calculate total earnings for this user
        const earningsResult = await Project.aggregate([
          { $match: { userId: user._id, status: 'completed' } },
          {
            $group: {
              _id: null,
              totalEarnings: {
                $sum: {
                  $cond: {
                    if: { $and: [{ $ne: ['$totalEarned', null] }, { $gt: ['$totalEarned', 0] }] },
                    then: '$totalEarned',
                    else: { $ifNull: ['$budget', 0] }
                  }
                }
              }
            }
          }
        ]);
        
        const totalEarnings = earningsResult[0]?.totalEarnings || 0;
        console.log(`  Total Earnings: $${totalEarnings}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAllUsers();